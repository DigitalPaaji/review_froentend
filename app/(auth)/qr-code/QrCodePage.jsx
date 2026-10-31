"use client"
import { QRCodeSVG } from 'qrcode.react'
import React, { useState } from 'react'
import { FiBriefcase, FiCheck, FiClock, FiCopy, FiDownload, FiExternalLink, FiShield } from 'react-icons/fi'

const QrCodePage = ({currentClient}) => {
 const [bgColor,setBgcolor]=useState("#ffffff")
  const [fgColor,setfgColorr]=useState("#000000")
// const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
const [error, setError] = useState("");

  const copyLink = async () => {
    if (!currentClient?.savedQrUrl) return;

    try {
      await navigator.clipboard.writeText(currentClient.savedQrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link. Please copy the URL manually.");
    }
  };

 
const downloadQr = async () => {
  const svg = document.getElementById("client-review-qr");

  if (!svg || !currentClient?.savedQrUrl) {
    setError("QR code is not available.");
    return;
  }

  let svgUrl;
  let pngUrl;

  try {
    setError("");

    const clonedSvg = svg.cloneNode(true);

    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", "800");
    clonedSvg.setAttribute("height", "800");

   
    const images = clonedSvg.querySelectorAll("image");

    for (const img of images) {
      const src =
        img.getAttribute("href") ||
        img.getAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href"
        );

      if (!src || src.startsWith("data:")) continue;

      const response = await fetch(
        new URL(src, window.location.href).href
      );

      if (!response.ok) {
        throw new Error("Unable to load the QR logo.");
      }

      const blob = await response.blob();

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Logo conversion failed."));
        reader.readAsDataURL(blob);
      });

      img.setAttribute("href", dataUrl);
      img.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        dataUrl
      );
    }

    const svgBlob = new Blob(
      [new XMLSerializer().serializeToString(clonedSvg)],
      { type: "image/svg+xml;charset=utf-8" }
    );

    svgUrl = URL.createObjectURL(svgBlob);

    // Load SVG into an image.
    const image = new window.Image();
    
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Unable to render QR code."));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to create canvas.");
    }

    // Selected background color.
    ctx.fillStyle = bgColor || "#ffffff";
    ctx.fillRect(0, 0, 800, 800);

    // Render QR and center logo.
    ctx.drawImage(image, 0, 0, 800, 800);

    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("PNG generation failed."));
        },
        "image/png"
      );
    });

    pngUrl = URL.createObjectURL(pngBlob);

    const safeName =
      (currentClient.businessName || "business")
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "business";

    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = `${safeName}-review-qr.png`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Do not revoke immediately; give the browser time to start downloading.
    setTimeout(() => {
      if (pngUrl) URL.revokeObjectURL(pngUrl);
    }, 2000);
  } catch (error) {
    console.error("QR download failed:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Unable to download QR image."
    );
  } finally {
    if (svgUrl) URL.revokeObjectURL(svgUrl);
  }
};




  return (
    <div className=''>

         <div className="space-y-6">
            {/* Status and business */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FiBriefcase size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      {currentClient.businessName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {currentClient.phone}
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <FiCheck size={15} />
                  QR Code Generated
                </span>
              </div>
            </section>

            {/* QR and actions */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                <h2 className="text-lg font-bold">Your review QR code</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Scan to open your personalized review page.
                </p>
              </div>

              <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                {/* QR preview */}
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-5">
               
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <QRCodeSVG
  id="client-review-qr"
  value={currentClient.savedQrUrl}
  title={"Title for my QR Code"}
  size={228}
  bgColor={bgColor}
  fgColor={fgColor}
  level={"L"}
  minVersion={5}
  imageSettings={{
    src: "/logo2.webp",
     x: undefined,
    y: undefined,
    height: 50,
    width:50,
    opacity: 1,
    excavate: true,
  }}
/>
         
         
      
                  </div>
                  

                  <p className="mt-4 text-sm font-semibold text-gray-800">
                    {currentClient.businessName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Scan to leave a review
                  </p>

                  <button
                    type="button"
                    onClick={downloadQr}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
                  >
                    <FiDownload size={17} />
                    Download QR as PNG
                  </button>
                </div>

                {/* Link and actions */}
                <div className="min-w-0">
                  <div  className="flex justify-between items-center">
                  <div className="mb-5">
                    <h3 className="text-base font-bold">Share your QR link</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Copy the link to share digitally, or open it to check
                      your review page.
                    </p>
                  </div>
   <div className="flex ">
                   <input type="color" value={bgColor} onChange={(e)=>setBgcolor(e.target.value)} />  
                   <input type="color" value={fgColor} onChange={(e)=>setfgColorr(e.target.value)} />  
                    <button onClick={()=>{setBgcolor("#ffffff"),setfgColorr("#000000")}} >Reset</button>

                   </div>

                   </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Your review URL
                    </p>

                    <p className="break-all text-sm leading-6 text-gray-800">
                      {currentClient.savedQrUrl}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={copyLink}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          copied
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-900 text-white hover:bg-gray-700"
                        }`}
                      >
                        {copied ? (
                          <FiCheck size={17} />
                        ) : (
                          <FiCopy size={17} />
                        )}
                        {copied ? "Link Copied!" : "Copy Link"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            currentClient.savedQrUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <FiExternalLink size={17} />
                        Open Review Page
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                      <FiShield className="mt-0.5 shrink-0 text-emerald-600" size={19} />
                      <div>
                        <p className="text-sm font-semibold">Easy to share</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Print it or share your link with customers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                      <FiClock className="mt-0.5 shrink-0 text-gray-500" size={19} />
                      <div>
                        <p className="text-sm font-semibold">Account expiry</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {currentClient.expiryDate
                            ? new Date(
                                currentClient.expiryDate
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
    </div>
  )
}

export default QrCodePage