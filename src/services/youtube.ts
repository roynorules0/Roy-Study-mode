const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function searchVideos(query: string, apiKey: string) {
  if (!apiKey) throw new Error('YouTube API Key is missing');
  
  const params = new URLSearchParams({
    part: 'snippet',
    maxResults: '12',
    q: `${query} study lectures neet jee`,
    type: 'video',
    key: apiKey,
  });

  const response = await fetch(`${SEARCH_URL}?${params}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}
