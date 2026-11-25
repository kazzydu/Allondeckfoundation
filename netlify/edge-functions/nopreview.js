// No link-preview card anywhere on the Foundation site (founder's request, 16 Nov 2026). Path set in netlify.toml.
//
// Removing the og:/twitter: tags is not enough: WhatsApp, iMessage and others
// still build a small card from <title>. So link-preview scrapers are refused
// outright and the shared link shows as plain text. Real visitors and search
// engines (Googlebot, Bingbot) are untouched — only preview bots are matched.
//
// iMessage previews identify as "facebookexternalhit ... Twitterbot", so they
// are covered by those tokens. Applebot is NOT listed: it is Apple's search
// crawler, not a previewer.
const PREVIEW_BOTS = /facebookexternalhit|facebot|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview|redditbot|snapchat|embedly|iframely|vkshare|bitlybot|tumblr|quora link preview|viber|line-poker|kakaotalk|microsoft teams|teams\/|zoom/i;

export default async (request, context) => {
  const ua = request.headers.get('user-agent') || '';
  if (PREVIEW_BOTS.test(ua)) {
    return new Response('', {
      status: 403,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
    });
  }
  return context.next();
};


