#!/usr/bin/env node

/**
 * Bulk unhide all LOCAL variables and variable collections from publishing.
 * Sets hiddenFromPublishing to false for every local variable and collection.
 *
 * Prerequisites:
 * - FIGMA_REST_API, FIGMA_FILE_ID in .env (or environment)
 * - Token must have file_variables:read AND file_variables:write scopes
 * - API is available to full members of Enterprise orgs
 *
 * Note: Remote variables/collections cannot be updated - only those created in this file.
 */

const fs = require("fs/promises");
const path = require("path");

async function hydrateEnv() {
  if (process.env.FIGMA_REST_API && process.env.FIGMA_FILE_ID) {
    return;
  }

  const envPath = path.join(process.cwd(), ".env");
  try {
    const contents = await fs.readFile(envPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let rawValue = trimmed.slice(eqIndex + 1).trim();
      if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
        rawValue = rawValue.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = rawValue;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function main() {
  try {
    await hydrateEnv();

    const token = process.env.FIGMA_REST_API;
    const fileId = process.env.FIGMA_FILE_ID;
    const branchKey = process.env.FIGMA_BRANCH_KEY;
    const apiBase = process.env.FIGMA_API_BASE_URL || "https://api.figma.com";

    if (!token || !fileId) {
      throw new Error(
        "Missing FIGMA_REST_API or FIGMA_FILE_ID. Set in .env or environment."
      );
    }

    const fileKey = branchKey || fileId;

    // 1. GET local variables
    const getUrl = `${apiBase}/v1/files/${fileKey}/variables/local`;
    const getRes = await fetch(getUrl, {
      headers: {
        "X-Figma-Token": token,
        "Content-Type": "application/json",
      },
    });

    if (!getRes.ok) {
      const body = await getRes.text();
      throw new Error(
        `GET variables failed (${getRes.status}): ${body}`
      );
    }

    const data = await getRes.json();
    const variables = data.meta?.variables || {};
    const collections = data.meta?.variableCollections || {};

    // Filter to LOCAL only (remote vars cannot be updated)
    const localCollectionIds = Object.entries(collections)
      .filter(([, c]) => !c.remote && c.hiddenFromPublishing === true)
      .map(([id]) => id);

    const localVariableIds = Object.entries(variables)
      .filter(([, v]) => !v.remote && v.hiddenFromPublishing === true)
      .map(([id]) => id);

    const collectionUpdates = localCollectionIds.map((id) => ({
      action: "UPDATE",
      id,
      hiddenFromPublishing: false,
    }));

    const variableUpdates = localVariableIds.map((id) => ({
      action: "UPDATE",
      id,
      hiddenFromPublishing: false,
    }));

    if (collectionUpdates.length === 0 && variableUpdates.length === 0) {
      console.log(
        "No local variables or collections have hiddenFromPublishing=true. Nothing to update."
      );
      return;
    }

    console.log(
      `Unhiding ${collectionUpdates.length} collections and ${variableUpdates.length} variables from publishing...`
    );

    const body = {};
    if (collectionUpdates.length > 0) {
      body.variableCollections = collectionUpdates;
    }
    if (variableUpdates.length > 0) {
      body.variables = variableUpdates;
    }

    const postUrl = `${apiBase}/v1/files/${fileKey}/variables`;
    const postRes = await fetch(postUrl, {
      method: "POST",
      headers: {
        "X-Figma-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!postRes.ok) {
      const bodyText = await postRes.text();
      throw new Error(
        `POST variables failed (${postRes.status}): ${bodyText}`
      );
    }

    const result = await postRes.json();
    if (result.error) {
      throw new Error(result.message || "Figma API returned an error");
    }

    console.log("✅ Successfully unhid all local variables and collections from publishing.");
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  }
}

main();
