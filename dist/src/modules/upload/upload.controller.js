"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;
let UploadController = class UploadController {
    uploadImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const base = (process.env.PUBLIC_ASSET_BASE_URL ||
            `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');
        const url = `${base}/uploads/products/${file.filename}`;
        return { url, filename: file.filename, size: file.size, mimetype: file.mimetype };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a product image (max 5MB, jpg/png/webp/gif)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', 'products'),
            filename: (_req, file, cb) => {
                const ext = (0, path_1.extname)(file.originalname).toLowerCase() || '.jpg';
                cb(null, `${(0, uuid_1.v4)()}${ext}`);
            },
        }),
        limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!ALLOWED_TYPES.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp, gif`), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "uploadImage", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('upload'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('upload')
], UploadController);
//# sourceMappingURL=upload.controller.js.map