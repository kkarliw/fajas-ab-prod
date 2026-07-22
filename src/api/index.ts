import { client } from "./client";
import { getProducts, getProductBySlug, getRelated } from "./products";
import { login, register, logout, getMe, verifyEmail, forgotPassword, resetPassword } from "./auth";
import { estimateCart } from "./cart";
import { getOrders, getOrderByReference, getGuestOrderByReference, initiateCheckout } from "./orders";
import { getWishlist, addToWishlist, removeFromWishlist } from "./wishlist";
import { getContentBlocks } from "./content";
import { validateCoupon } from "./coupons";
import { createPqr, getPqrStatus } from "./pqr";
import { getTestimonials, createTestimonial } from "./testimonials";
import { subscribeToNewsletter } from "./subscribers";
import { getStoreSettings, updateStoreSettings } from "./settings";
import { getAddresses, createAddress, deleteAddress, setDefaultAddress } from "./addresses";

import { getAdminStats, getAdminOrders, updateOrderStatus, createProduct, updateProduct, deleteProduct, getAdminProducts, updateProductStatus, uploadImage, getAdminCoupons, createCoupon, updateCoupon, deleteCoupon, getAdminPqrs, updatePqr, getAdminSubscribers, deleteAdminSubscriber, getAdminCampaigns, createCampaign, deleteCampaign } from "./admin";

export const api = {
  client,
  products: {
    getProducts,
    getProductBySlug,
    getRelated,
  },
  auth: {
    login,
    register,
    logout,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword,
  },
  cart: {
    estimateCart,
  },
  orders: {
    getOrders,
    getOrderByReference,
    getGuestOrderByReference,
    initiateCheckout,
  },
  admin: {
    getAdminStats,
    getAdminOrders,
    updateOrderStatus,
    getAdminProducts,
    createProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct,
    uploadImage,
    getAdminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAdminPqrs,
    updatePqr,
    getAdminSubscribers,
    deleteAdminSubscriber,
    getAdminCampaigns,
    createCampaign,
    deleteCampaign,
  },
  pqr: {
    createPqr,
    getPqrStatus,
  },
  coupons: {
    validateCoupon,
  },
  wishlist: {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
  },
  content: {
    getContentBlocks,
  },
  testimonials: {
    getTestimonials,
    createTestimonial,
  },
  subscribers: {
    subscribeToNewsletter,
  },
  settings: {
    getStoreSettings,
    updateStoreSettings,
  },
  addresses: {
    getAddresses,
    createAddress,
    deleteAddress,
    setDefaultAddress,
  }
};
