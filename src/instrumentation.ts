export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    const { installHomepageNegotiation } = await import('./lib/homepage-negotiation.node');
    installHomepageNegotiation();
  }
}
