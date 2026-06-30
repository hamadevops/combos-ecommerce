"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Clock, Loader2, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { getImageUrl, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchOverlayContent({ isOpen, onClose }: SearchOverlayProps) {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";

  const [keyword, setKeyword] = useState(urlSearch);
  const debouncedKeyword = useDebounce(keyword, 500);
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();
  // Using an explicit ref strictly for input focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save history helper
  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...history.filter((h) => h !== term)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("search_history");
  };

  useEffect(() => {
    if (isOpen) {
      setKeyword(urlSearch); // Pre-fill with current search params when overlay opens
      document.body.style.overflow = "hidden";
      // Slight delay ensures the element is mounted and CSS transition has started before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, urlSearch]);

  const {
    data: results,
    isLoading,
    isFetching,
  } = useProducts({
    search: debouncedKeyword || undefined,
    limit: 10,
    enabled: isOpen && !!debouncedKeyword,
  });

  const products = results?.data || [];
  const showResults = debouncedKeyword.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    saveToHistory(keyword.trim());
    onClose();
    router.push(`/san-pham?search=${encodeURIComponent(keyword.trim())}`);
  };

  const handleHistoryClick = (term: string) => {
    setKeyword(term);
    saveToHistory(term);
    onClose();
    router.push(`/san-pham?search=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (slug: string) => {
    saveToHistory(keyword.trim());
    onClose();
    router.push(`/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 sm:max-w-md sm:mx-auto sm:border-x sm:border-border">
      {/* Search Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-background pt-safe-top">
        <div className="flex-1 flex items-center bg-secondary rounded-xl px-4 h-[42px] relative border border-transparent focus-within:border-primary focus-within:bg-background/50 transition-all shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <form onSubmit={handleSearch} className="flex-1 flex items-center h-full">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full h-full bg-transparent border-none outline-none px-3 text-[15px] placeholder:text-muted-foreground text-foreground"
            />
          </form>
          {keyword && (
            <button 
              onClick={() => setKeyword("")} 
              className="p-1 shrink-0 -mr-1" 
              type="button"
              aria-label="Xóa từ khóa"
            >
              <div className="w-[18px] h-[18px] bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-background" />
              </div>
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="font-semibold text-[15px] px-1 text-foreground hover:text-primary transition-colors shrink-0"
        >
          Đóng
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background pb-safe-bottom">
        {/* Loading State */}
        {showResults && (isLoading || isFetching) && (
          <div className="flex flex-col items-center justify-center p-12 opacity-80 animate-in fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Đang tải kết quả...</p>
          </div>
        )}

        {/* Live Results */}
        {showResults && !(isLoading || isFetching) && (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-300">
            {products.length > 0 ? (
              <div className="divide-y divide-border">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug!)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border/50">
                      {product.images?.[0]?.url ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={getImageUrl(product.images[0].url)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <Search className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-[14.5px] font-medium text-foreground line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-primary font-bold text-[13px] mt-0.5">
                        {formatPrice(product.salePrice || product.price)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  </button>
                ))}

                <button
                  onClick={handleSearch}
                  className="w-full p-4 flex items-center justify-center gap-2 text-primary text-[14.5px] font-bold hover:bg-primary/5 transition-colors group"
                >
                  Xem tất cả kết quả cho "{keyword}"{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border/50">
                  <Search className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-foreground font-bold text-[16px]">Không tìm thấy kết quả</p>
                <p className="text-[13px] text-muted-foreground mt-1.5 max-w-[250px]">
                  Hãy thử tìm kiếm với từ khóa khác, ngắn gọn hoặc chung chung hơn.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search History */}
        {!showResults && history.length > 0 && (
          <div className="p-4 pt-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px] text-foreground">Tìm kiếm gần đây</h3>
              <button
                onClick={clearHistory}
                className="text-[13px] font-medium text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                Xóa thư mục
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {history.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(term)}
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 bg-secondary border border-transparent hover:border-primary/30 rounded-full text-[13.5px] text-foreground transition-all shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchOverlay(props: SearchOverlayProps) {
  return (
    <Suspense fallback={null}>
      <SearchOverlayContent {...props} />
    </Suspense>
  );
}
