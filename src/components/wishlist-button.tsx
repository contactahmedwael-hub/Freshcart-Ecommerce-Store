"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { initializeWishlistItem, toggleWishlist } from "@/lib/wishlist-state";
export function WishlistButton({ productId, title, initialSelected = false, refreshOnToggle = false }: { productId: string; title: string; initialSelected?: boolean; refreshOnToggle?: boolean }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const hydrated = useSelector((state: RootState) => state.wishlist.hydrated.includes(productId));
  const selected = useSelector((state: RootState) => state.wishlist.selected.includes(productId));
  const busy = useSelector((state: RootState) => state.wishlist.busy.includes(productId));
  useEffect(() => { dispatch(initializeWishlistItem({ productId, selected: initialSelected })); }, [dispatch, initialSelected, productId]);
  const isSelected = hydrated ? selected : initialSelected;
  async function toggle() {
    if (busy) return;
    try {
      await dispatch(toggleWishlist({ productId, selected: isSelected })).unwrap();
      toast.success(isSelected ? `${title} removed from your wishlist.` : `${title} added to your wishlist.`);
      if (refreshOnToggle) router.refresh();
    } catch (error) { toast.error(typeof error === "string" ? error : error instanceof Error ? error.message : "Could not update your wishlist."); }
  }
  return <span className="wishlist-control"><button className={`favorite ${isSelected ? "is-favorite" : ""}`} onClick={toggle} disabled={busy} aria-label={busy ? `Updating wishlist for ${title}` : isSelected ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`} aria-pressed={isSelected} title={isSelected ? "Remove from wishlist" : "Add to wishlist"}>{busy ? <LoaderCircle className="spin" size={17}/> : <Heart size={17} fill={isSelected ? "currentColor" : "none"}/>}</button></span>;
}
