export const user = profileService => {
  return async (ctx, next) => {
    ctx.userID = profileService.getClientIpMappedUserId(ctx.clientIP);
    await next();
  };
};
