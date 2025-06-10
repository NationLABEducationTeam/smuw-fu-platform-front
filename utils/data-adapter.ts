export class SearchResultAdapter {
    static standardize(googleData: any) {
        // 기본 응답 구조
        const defaultResponse = {
            metadata: {
                hasKnowledgeGraph: false,
                hasImages: false,
                hasSearchResults: false,
                hasRelatedSearches: false
            },
            data: {
                knowledgeGraph: null,
                images: [],
                searchResults: [],
                relatedSearches: []
            }
        };

        // googleData가 없거나 유효하지 않은 경우 기본 응답 반환
        if (!googleData || typeof googleData !== 'object') {
            return defaultResponse;
        }

        try {
            return {
                metadata: {
                    hasKnowledgeGraph: Boolean(googleData?.knowledge_graph),
                    hasImages: Boolean(googleData?.inline_images?.length),
                    hasSearchResults: Boolean(googleData?.organic_results?.length),
                    hasRelatedSearches: Boolean(googleData?.related_searches?.length),
                },
                data: {
                    knowledgeGraph: googleData?.knowledge_graph || null,
                    images: googleData?.inline_images || [],
                    searchResults: googleData?.organic_results || [],
                    relatedSearches: googleData?.related_searches || []
                }
            };
        } catch (error) {
            console.error('Error standardizing data:', error);
            return defaultResponse;
        }
    }
}

export const adaptGoogleSearchData = (googleData: any) => {
    return SearchResultAdapter.standardize(googleData);
}; 