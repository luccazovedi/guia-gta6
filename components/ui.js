"use client";
import { useEffect, useRef } from "react";
import { Heart, ChevronRight, Lock } from "lucide-react";

export const fmtDate = (d) => new Date(String(d).length === 10 ? d + "T12:00:00" : d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
export const fold = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])';

// Janela que sobe de baixo: fecha com Esc ou tocando fora, prende o foco e o devolve ao fechar.
export function Sheet({ close, className = "", label, children, light }) {
  const ref = useRef(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab" || !ref.current) return;
      const els = [...ref.current.querySelectorAll(FOCUSABLE)];
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (prev && prev.focus && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, []);
  return (
    <div className={"scrim" + (light ? " light" : "")} onClick={() => closeRef.current()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={"sheet " + className} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {children}
      </div>
    </div>
  );
}

export const FavBtn = ({ on, onClick }) => (
  <button className={"favbtn" + (on ? " on" : "")} onClick={onClick} aria-label={on ? "Remover dos favoritos" : "Favoritar"} aria-pressed={!!on}>
    <Heart size={18} fill={on ? "currentColor" : "none"} />
  </button>
);

export function ResultList({ items }) {
  return (
    <ul className="cards">
      {items.map((x) => (
        <li key={x.k}>
          <button className="glass result" onClick={x.act}>
            <span className="grow"><small className="genre">{x.kind}</small><b>{x.name}</b>{x.sub && <small>{x.sub}</small>}</span>
            <ChevronRight size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function LockCard({ openPro, title, text }) {
  return (
    <button className="glass lockcard" onClick={openPro}>
      <span className="lockicon"><Lock size={18} /></span>
      <span className="grow"><b>{title}</b><small>{text}</small></span>
      <ChevronRight size={18} />
    </button>
  );
}

export function Bar({ v, thin = true, className = "" }) {
  const pct = Math.max(0, Math.min(100, v * 100));
  return <div className={"bar" + (thin ? " thin" : "") + (className ? " " + className : "")} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}><span style={{ width: pct + "%" }} /></div>;
}
