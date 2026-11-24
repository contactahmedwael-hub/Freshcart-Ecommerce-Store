"use client";

import Image from "next/image";
import { Search, ArrowUpRight, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Brand } from "@/lib/types";

const BRANDS_PER_PAGE = 12;

export function BrandDirectory({ brands }: { brands: Brand[] }) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(BRANDS_PER_PAGE);
  const filtered = useMemo(() => brands.filter(brand => brand.name.toLowerCase().includes(search.trim().toLowerCase())), [brands, search]);
  const visible = filtered.slice(0, visibleCount);
  return <><label className="brand-search"><Search size={17}/><input value={search} onChange={event => { setSearch(event.target.value); setVisibleCount(BRANDS_PER_PAGE); }} placeholder="Search brands" aria-label="Search brands"/></label>{visible.length ? <><div className="brand-directory-grid">{visible.map(brand=><a className="brand-directory-card" href={`/brands/${brand._id}`} key={brand._id}><span className="brand-logo">{brand.image ? <Image src={brand.image} alt={`${brand.name} logo`} fill sizes="(max-width: 680px) 42vw, 240px" unoptimized/> : brand.name.slice(0,1).toUpperCase()}</span><b>{brand.name}</b><span>View products <ArrowUpRight size={14}/></span></a>)}</div>{visible.length < filtered.length && <button className="load-more-button brand-show-more" type="button" onClick={() => setVisibleCount(count => Math.min(count + BRANDS_PER_PAGE, filtered.length))}>Show more brands <ChevronDown size={16}/></button>}</> : <div className="empty-state"><h3>No brands found</h3><p>Try another search term.</p></div>}</>;
}
