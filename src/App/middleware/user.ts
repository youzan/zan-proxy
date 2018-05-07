export const user = profileService => {
  return async (ctx, next) => {
    if (ctx.ignore) {
      await next();
      return;
    }
    ctx.userID = profileService.getClientIpMappedUserId(ctx.clientIP);
    await next();
  };
};
