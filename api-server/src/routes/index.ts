import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import bannersRouter from "./banners";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(bannersRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(analyticsRouter);

export default router;
