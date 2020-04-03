export async function getUptime() {
    return { uptime: process.uptime() };
}
