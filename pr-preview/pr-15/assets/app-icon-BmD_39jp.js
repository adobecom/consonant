import{E as d,x as g}from"./iframe-CwxTZfUT.js";const f="https://www.adobe.com/content/dam/shared/images/product-icons/svg",r="experience-cloud",n={"creative-cloud":{label:"Adobe Creative Cloud",filename:"creative-cloud.svg"},"experience-cloud":{label:"Adobe Experience Cloud",filename:"experience-cloud.svg"},"document-cloud":{label:"Adobe Document Cloud",filename:"document-cloud.svg"},stock:{label:"Adobe Stock",filename:"stock.svg"},fonts:{label:"Adobe Fonts",filename:"fonts.svg"},behance:{label:"Adobe Behance",filename:"behance.svg"},portfolio:{label:"Adobe Portfolio",filename:"portfolio.svg"},firefly:{label:"Adobe Firefly",filename:"firefly.svg"},"gen-studio":{label:"Adobe GenStudio",filename:"gen-studio.svg"},express:{label:"Adobe Express",filename:"cc-express.svg"},"acrobat-pro":{label:"Adobe Acrobat Pro",filename:"acrobat.svg"},"acrobat-pdf":{label:"Adobe Acrobat Reader",filename:"acrobat-reader.svg"},"acrobat-sign":{label:"Adobe Acrobat Sign",filename:"sign.svg"},scan:{label:"Adobe Scan",filename:"scan.svg"},photoshop:{label:"Adobe Photoshop",filename:"photoshop.svg"},lightroom:{label:"Adobe Lightroom",filename:"lightroom.svg"},"lightroom-classic":{label:"Adobe Lightroom Classic",filename:"lightroom-classic.svg"},fresco:{label:"Adobe Fresco",filename:"fresco.svg"},"premiere-pro":{label:"Adobe Premiere Pro",filename:"premiere.svg"},"after-effects":{label:"Adobe After Effects",filename:"after-effects.svg"},audition:{label:"Adobe Audition",filename:"audition.svg"},"character-animator":{label:"Adobe Character Animator",filename:"character-animator.svg"},"media-encoder":{label:"Adobe Media Encoder",filename:"media-encoder.svg"},"premiere-rush":{label:"Adobe Premiere Rush",filename:"rush.svg"},illustrator:{label:"Adobe Illustrator",filename:"illustrator.svg"},indesign:{label:"Adobe InDesign",filename:"indesign.svg"},incopy:{label:"Adobe InCopy",filename:"incopy.svg"},bridge:{label:"Adobe Bridge",filename:"bridge.svg"},animate:{label:"Adobe Animate",filename:"animate.svg"},dreamweaver:{label:"Adobe Dreamweaver",filename:"dreamweaver.svg"},"substance-3d":{label:"Adobe Substance 3D",filename:"substance-3d.svg"},dimension:{label:"Adobe Dimension",filename:"dimension.svg"},aero:{label:"Adobe Aero",filename:"aero.svg"},"experience-platform":{label:"Adobe Experience Platform",filename:"experience-platform.svg"},"experience-manager":{label:"Adobe Experience Manager",filename:"experience-manager.svg"},analytics:{label:"Adobe Analytics",filename:"analytics.svg"},campaign:{label:"Adobe Campaign",filename:"campaign.svg"},"customer-journey":{label:"Adobe Customer Journey Analytics",filename:"customer-journey-analytics.svg"},"real-time-cdp":{label:"Adobe Real-Time CDP",filename:"real-time-cdp.svg"},"journey-optimizer":{label:"Adobe Journey Optimizer",filename:"journey-optimizer.svg"},target:{label:"Adobe Target",filename:"target.svg"},marketo:{label:"Adobe Marketo Engage",filename:"marketo.svg"},workfront:{label:"Adobe Workfront",filename:"workfront.svg"}},l={xs:{px:16},sm:{px:18},md:{px:24},lg:{px:32}},A=e=>n[e]??n[r],p=e=>l[e]?e:"md",v=e=>`${f}/${e}`,x=({app:e=r,size:s="md",ariaHidden:o=!0,ariaLabel:t,loading:b="lazy",importance:c="auto"}={})=>{const i=A(e),a=p(s),m=`${i.label} app icon`;return g`
    <span
      class="c-app-icon"
      data-size=${a}
      role="img"
      aria-hidden=${o?"true":"false"}
      aria-label=${o?d:t??m}
    >
      <img
        class="c-app-icon__img"
        src="${v(i.filename)}"
        alt=""
        width=${l[a].px}
        height=${l[a].px}
        loading=${b}
        importance=${c}
        decoding="async"
        draggable="false"
        aria-hidden="true"
      />
    </span>
  `};export{x as A};
