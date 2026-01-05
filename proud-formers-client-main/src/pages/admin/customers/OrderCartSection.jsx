import { ShoppingCart, Tag, ReceiptText, PackageCheck } from "lucide-react";

export default function OrderCartSection({ cartData = {}, onViewVariant }) {
  const items = cartData?.cart_item_nested_fields || [];

  if (!items.length) {
    return (
      <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
        <ShoppingCart size={48} className="mb-4 opacity-10" />
        <p className="font-medium">The customer's cart is empty</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* LEFT: PRODUCT VISUALIZATION LIST (2 Columns wide) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <PackageCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Cart Contents
                </h2>
                <p className="text-xs text-gray-500">
                  {items.length} items staged for checkout
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-gray-50/80 transition-all group"
              >
                <div className="flex gap-5 items-center">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img
                      src={
                        item.product_variant?.product?.primary_image?.url ||
                        "/placeholder.png"
                      }
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4
                          className="font-bold text-gray-900 truncate hover:text-primary cursor-pointer transition-colors"
                          onClick={() =>
                            onViewVariant?.(item.product_variant?.id)
                          }
                        >
                          {item.product_variant?.product?.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {item.product_variant?.variant_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Unit Price</p>
                        <p className="text-sm font-semibold text-gray-700">
                          ₹{item.product_variant?.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold uppercase tracking-tight">
                          SKU: {item.product_variant?.sku}
                        </span>
                        <span className="text-[10px] text-gray-400">|</span>
                        <span className="text-xs font-bold text-gray-700">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-base font-black text-gray-900">
                          ₹{item.After_discounted_total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: FINANCIAL SUMMARY BREAKUP */}
      <div className="lg:col-span-1">
        <div className="bg-[#1e293b] rounded-3xl shadow-xl p-8 text-white sticky top-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-lg">
              <ReceiptText size={20} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">Order Summary</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium text-white font-mono">
                ₹{cartData.actual_amount}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span className="text-sm">Item Discounts</span>
              <span className="font-medium text-green-400 font-mono">
                -₹{cartData.total_discount}
              </span>
            </div>

            {cartData.coupon_active && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Tag size={14} />
                    <span className="text-xs font-bold uppercase">
                      {cartData.coupon_code}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-400">
                    -₹{cartData.coupon_discount}
                  </span>
                </div>
              </div>
            )}

            <div className="h-px bg-white/10 my-4"></div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                Total Payable
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">
                  ₹{cartData.dicounted_total_price}
                </span>
              </div>
            </div>

            {/* <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl mt-6 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
              Proceed to Order
            </button> */}
          </div>

          {/* Decorative element */}
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-gray-500">
            <PackageCheck size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-center">
              Admin Controlled Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
