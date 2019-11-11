declare module 'parse-domain' {
  interface ParseOptions {
    // A list of custom tlds that are first matched against the url.
    // Useful if you also need to split internal URLs like localhost.
    customTlds: RegExp | string[];

    // There are lot of private domains that act like top-level domains,
    // like blogspot.com, googleapis.com or s3.amazonaws.com.
    // By default, these domains would be split into:
    // { subdomain: ..., domain: "blogspot", tld: "com" }
    // When this flag is set to true, the domain will be split into
    // { subdomain: ..., domain: ..., tld: "blogspot.com" }
    // See also https://github.com/peerigon/parse-domain/issues/4
    // default value is false
    privateTlds?: boolean;
  }

  interface ParsedDomain {
    tld: string;
    domain: string;
    subdomain: string;
  }

  export default function parseDomain(url: string, options?: ParseOptions): ParsedDomain | null;
}
