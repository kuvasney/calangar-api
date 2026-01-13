import 'dotenv/config';
interface TokenPayload {
    userId: string;
    email: string;
}
export declare const jwtService: {
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
    generateTokenPair(payload: TokenPayload): {
        accessToken: string;
        refreshToken: string;
    };
};
export {};
//# sourceMappingURL=jwt.service.d.ts.map