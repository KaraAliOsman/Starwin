import React from "react";

type PriceChange = "sube" | "baja" | "estable";

type PriceItem = {
  id: string;
  material: string;
  priceClpKg: number;
  change: PriceChange;
};

type PriceTickerProps = {
  prices: PriceItem[];
  updatedAt: string;
};

const changeStyles: Record<PriceChange, { label: string; className: string }> = {
  sube: { label: "Sube", className: "text-emerald-600" },
  baja: { label: "Baja", className: "text-rose-600" },
  estable: { label: "Estable", className: "text-slate-500" },
};

const formatClp = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

export function PriceTicker({ prices, updatedAt }: PriceTickerProps) {
  const tickerItems = prices.length ? prices : [];

  return (
    <div className="bg-[#0B1D33] text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 overflow-hidden px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#69C17D]">
          <span className="h-2 w-2 rounded-full bg-[#69C17D]" />
          Precios hoy
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="ticker flex w-max min-w-full items-center gap-8 pr-8">
            {tickerItems.map((item) => {
              const change = changeStyles[item.change];
              return (
                <div key={item.id} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-white/70">{item.material}</span>
                  <span className="text-sm font-semibold">{formatClp(item.priceClpKg)}/Kg</span>
                  <span className={`text-xs font-semibold ${change.className}`}>{change.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-xs text-white/60">Actualizado: {updatedAt}</div>
      </div>
      <style jsx>{`
        .ticker {
          animation: ticker 22s linear infinite;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
