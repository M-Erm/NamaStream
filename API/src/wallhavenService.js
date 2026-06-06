export async function returnWallhavenData(query)
{
    const response = await fetch(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&categories=111&purity=100&sorting=relevance&order=desc`)
    
    if (!response.ok) {
        console.error("Erro ao buscar dados do Wallhaven:", await response.text());
        return [];
    }
    
    const ResponseData = await response.json();
    return ResponseData;
}