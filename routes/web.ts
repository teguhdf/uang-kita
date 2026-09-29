import AuthHandler from "../app/handlers/auth.handler";
import AppHandler from "../app/handlers/app.handler";
import UangKitaHandler from "../app/handlers/uang-kita.handler";
import PublicHandler from "../app/handlers/public.handler";
import UploadHandler from "../app/handlers/upload.handler";
import S3Handler from "../app/handlers/s3.handler";
import StorageHandler from "../app/handlers/storage.handler";
import AssetHandler from "../app/handlers/asset.handler";
import { authRequired } from "../app/middlewares/auth.middleware";
import HyperExpress from "hyper-express";

// Rate limiting middleware
import {
	authRateLimit,
	apiRateLimit,
	passwordResetRateLimit,
	createAccountRateLimit,
	uploadRateLimit,
} from "../app/middlewares/rate-limit.middleware";

const Route = new HyperExpress.Router();

/**
 * Public Routes
 */
Route.get("/", PublicHandler.index);
Route.get("/test", PublicHandler.test);
Route.get("/test2", PublicHandler.test2);

/**
 * Upload Routes
 */
Route.post(
	"/api/upload/image",
	[authRequired, uploadRateLimit],
	UploadHandler.uploadImage,
);
Route.post(
	"/api/upload/file",
	[authRequired, uploadRateLimit],
	UploadHandler.uploadFile,
);

/**
 * S3 Routes
 */
Route.post(
	"/api/s3/signed-url",
	[authRequired, uploadRateLimit],
	S3Handler.getSignedUrl,
);
Route.get(
	"/api/s3/public-url/:fileKey",
	[apiRateLimit],
	S3Handler.getPublicUrl,
);
Route.get("/api/s3/health", [apiRateLimit], S3Handler.health);

/** Local storage static files */
Route.get("/storage/*", StorageHandler.serveFile);

/** Authentication Routes */
Route.get("/login", AuthHandler.loginPage);
Route.post("/login", [authRateLimit], AuthHandler.processLogin);
Route.get("/register", AuthHandler.registerPage);
Route.post("/register", [createAccountRateLimit], AuthHandler.processRegister);
Route.post("/logout", AuthHandler.logout);
Route.get("/google/redirect", AuthHandler.googleRedirect);
Route.get("/google/callback", AuthHandler.googleCallback);

/** Password Reset Routes */
Route.get("/forgot-password", AuthHandler.forgotPasswordPage);
Route.post(
	"/forgot-password",
	[passwordResetRateLimit],
	AuthHandler.sendResetPassword,
);
Route.get("/reset-password/:id", AuthHandler.resetPasswordPage);
Route.post("/reset-password", [authRateLimit], AuthHandler.resetPassword);

/** Protected Routes */
Route.get("/home", [authRequired], AppHandler.homePage);
Route.get("/onboarding", [authRequired], UangKitaHandler.onboardingPage);
Route.post("/onboarding", [authRequired], UangKitaHandler.saveOnboarding);
Route.get(
	"/aman-kalau-dibeli",
	[authRequired],
	UangKitaHandler.purchaseSimulatorPage,
);
Route.post(
	"/keputusan",
	[authRequired],
	UangKitaHandler.savePurchaseDecision,
);
Route.get(
	"/aturan-keputusan",
	[authRequired],
	UangKitaHandler.decisionRulesPage,
);
Route.post(
	"/aturan-keputusan",
	[authRequired],
	UangKitaHandler.saveDecisionRules,
);
Route.post(
	"/invite-partner",
	[authRequired],
	UangKitaHandler.invitePartner,
);
Route.get("/profile", [authRequired], AppHandler.profilePage);
Route.post("/change-profile", [authRequired], AppHandler.changeProfile);
Route.post("/change-password", [authRequired], AuthHandler.changePassword);
Route.delete("/users", [authRequired], AppHandler.deleteUsers);

/** Static Asset Handling Routes */
Route.get("/assets/:file", AssetHandler.distFolder);
Route.get("/public/*", AssetHandler.publicFolder);

export default Route;
