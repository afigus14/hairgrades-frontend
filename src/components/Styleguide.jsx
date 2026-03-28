import React from "react";

const swatches = [
  { name: "brand.gray", hex: "#5F6366" },
  { name: "brand.blue", hex: "#4D6D9A" },
  { name: "brand.periwinkle", hex: "#86B3D1" },
  { name: "brand.aqua", hex: "#99CED3" },
  { name: "brand.blush", hex: "#EDB5BF" },
];

export default function Styleguide() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="surface p-6">
        <h1 className="font-serif text-3xl text-brand-blue">Styleguide</h1>

        <h2 className="mt-6 text-xl font-semibold text-brand-blue">Palette</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
          {swatches.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-lg shadow">
              <div style={{ background: s.hex }} className="h-20 w-full" />
              <div className="p-2 text-xs">
                <div className="font-medium">{s.name}</div>
                <div className="text-brand-gray/70">{s.hex}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-xl font-semibold text-brand-blue">Buttons</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-cta">CTA</button>
          <button className="btn bg-white ring-1 ring-brand-periwinkle/50 text-brand-blue hover:bg-brand-periwinkle/10">
            Secondary
          </button>
        </div>

        <h2 className="mt-8 text-xl font-semibold text-brand-blue">Card</h2>
        <div className="mt-3 surface p-4">
          <p className="text-brand-gray">
            This is a generic card surface using the shared “surface” utility.
          </p>
        </div>
      </div>
    </main>
  );
}
