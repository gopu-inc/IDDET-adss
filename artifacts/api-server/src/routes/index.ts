import { Router, type IRouter } from "express";
import healthRouter from "./health";
import iddetAdsRouter from "./iddet-ads";
import authRouter from "./auth";
import shopifyOAuthRouter from "./shopify-oauth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(shopifyOAuthRouter);
router.use(iddetAdsRouter);

export default router;
