/** @type {import('next').NextConfig} */
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesPath = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: pagesPath,
  assetPrefix: pagesPath,
  env: {
    NEXT_PUBLIC_BASE_PATH: pagesPath
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
