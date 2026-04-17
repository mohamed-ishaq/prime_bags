import React from 'react';

const ProductImageGallery = ({ imageUrls, activeUrl, onSelect, alt = 'Product image' }) => {
    const urls = Array.isArray(imageUrls) ? imageUrls : [];

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
                <img
                    src={activeUrl || 'https://via.placeholder.com/900x900?text=Prime+Bags'}
                    alt={alt}
                    className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[520px]"
                />
            </div>

            <div className="rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-black/5 backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">All Images</h3>
                    <span className="text-xs text-slate-500">{urls.length} photo{urls.length === 1 ? '' : 's'}</span>
                </div>

                {urls.length === 0 ? (
                    <div className="text-sm text-slate-500">No images</div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {urls.map((url) => {
                            const selected = url === activeUrl;
                            return (
                                <button
                                    key={url}
                                    type="button"
                                    onClick={() => onSelect(url)}
                                    className={[
                                        'group relative h-16 w-16 flex-none overflow-hidden rounded-2xl ring-2 transition',
                                        selected ? 'ring-lime-400' : 'ring-transparent hover:ring-slate-200',
                                    ].join(' ')}
                                    aria-label="Select product image"
                                >
                                    <img
                                        src={url}
                                        alt=""
                                        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductImageGallery;

