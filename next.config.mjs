/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                port: "",
                pathname: "/a/zmmbcgzp6s/**"
            }
        ]
    }
};

export default nextConfig;
