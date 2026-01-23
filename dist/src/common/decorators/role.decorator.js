"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRequired = void 0;
const common_1 = require("@nestjs/common");
const RoleRequired = (role) => (0, common_1.SetMetadata)('role', role);
exports.RoleRequired = RoleRequired;
//# sourceMappingURL=role.decorator.js.map