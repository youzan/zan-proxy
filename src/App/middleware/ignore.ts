export class Ignorer {
  private patterns: string[] = [];
  public addPattern(pattern: string) {
    this.patterns.push(pattern);
  }
  public async middleware(ctx, next) {
    let shouldIgnore = false;
    for (const pattern of this.patterns) {
      if (ctx.req.url.includes(pattern)) {
        shouldIgnore = true;
        break;
      }
    }
    if (shouldIgnore) {
      ctx.ignore = true;
    }
    await next();
  }
}
