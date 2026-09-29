import AuthHandler from "../app/handlers/auth.handler";
import AppHandler from "../app/handlers/app.handler";
import UangKitaHandler from "../app/handlers/uang-kita.handler";
import PublicHandler from "../app/handlers/public.handler";
import UploadHandler from "../app/handlers/upload.handler";
import StorageHandler from "../app/handlers/storage.handler";
import AssetHandler from "../app/handlers/asset.handler";
import { authRequired } from "../app/middlewares/auth.middleware";
import HyperExpress from "hyper-express";

import {
	authRateLimit,
	passwordResetRateLimit,
	createAccountRateLimit,
	uploadRateLimit,
} from "../app/middlewares/rate-limit.middleware";

const Route = new HyperExpress.Router();

/** Public */
Route.get("/", PublicHandler.index);
Route.get("/healthz", PublicHandler.health);

/** Product-required upload only: profile images. */
Route.post(
	"/api/upload/image",
	[authRequired, uploadRateLimit],
	UploadHandler.uploadImage,
);
Route.get("/storage/*", StorageHandler.serveFile);

/** Authentication */
Route.get("/login", AuthHandler.loginPage);
Route.post("/login", [authRateLimit], AuthHandler.processLogin);
Route.get("/register", AuthHandler.registerPage);
Route.post("/register", [createAccountRateLimit], AuthHandler.processRegister);
Route.post("/logout", AuthHandler.logout);
Route.get("/google/redirect", AuthHandler.googleRedirect);
Route.get("/google/callback", AuthHandler.googleCallback);

/** Password recovery */
Route.get("/forgot-password", AuthHandler.forgotPasswordPage);
Route.post(
	"/forgot-password",
	[passwordResetRateLimit],
	AuthHandler.sendResetPassword,
);
Route.get("/reset-password/:id", AuthHandler.resetPasswordPage);
Route.post("/reset-password", [authRateLimit], AuthHandler.resetPassword);

/** UANG KITA */
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
Route.get(
	"/undangan-pasangan",
	[authRequired],
	UangKitaHandler.partnerInvitePage,
);
Route.post(
	"/undangan-pasangan/terima",
	[authRequired],
	UangKitaHandler.acceptPartnerInvite,
);
Route.post(
	"/undangan-pasangan/tolak",
	[authRequired],
	UangKitaHandler.rejectPartnerInvite,
);
Route.get("/profile", [authRequired], AppHandler.profilePage);
Route.post("/change-profile", [authRequired], AppHandler.changeProfile);
Route.post("/auth/change-password", [authRequired], AuthHandler.changePassword);

/** Static build/public assets */
Route.get("/assets/:file", AssetHandler.distFolder);
Route.get("/public/*", AssetHandler.publicFolder);

export default Route;
