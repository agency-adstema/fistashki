"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProduct = useProduct;
exports.useUpdateProduct = useUpdateProduct;
exports.useDeleteProduct = useDeleteProduct;
exports.useCreateProduct = useCreateProduct;
const react_query_1 = require("@tanstack/react-query");
const api_1 = __importDefault(require("@/lib/api"));
function unwrap(body) {
    if (body && typeof body === 'object' && 'data' in body) {
        const b = body;
        if (b.data !== undefined)
            return b.data;
    }
    return body;
}
function useProduct(id) {
    return (0, react_query_1.useQuery)({
        queryKey: ['admin', 'product', id],
        queryFn: async () => {
            const { data } = await api_1.default.get(`/products/${id}`);
            return unwrap(data);
        },
        enabled: Boolean(id),
    });
}
function useUpdateProduct() {
    const qc = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async ({ id, payload }) => {
            const { data } = await api_1.default.patch(`/products/${id}`, payload);
            return unwrap(data);
        },
        onSuccess: (_data, { id }) => {
            void qc.invalidateQueries({ queryKey: ['admin', 'product', id] });
            void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}
function useDeleteProduct() {
    const qc = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            const { data } = await api_1.default.delete(`/products/${id}`);
            return unwrap(data);
        },
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}
function useCreateProduct() {
    const qc = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            const { data } = await api_1.default.post(`/products`, payload);
            return unwrap(data);
        },
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}
//# sourceMappingURL=useProducts.js.map