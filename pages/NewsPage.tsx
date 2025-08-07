

import React, { useState, useEffect } from 'react';
import { fetchCommunityNews } from '../services/geminiService';
import { getBlogPosts } from '../services/api';
import { NewsArticle, BlogPost } from '../types';
import { useAppContext } from '../context/AppContext';
import Spinner from '../components/Spinner';

const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row group">
        <div className="md:w-1/2">
            <img src={post.imageUrl} alt={post.title} className="h-48 md:h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"/>
        </div>
        <div className="p-6 md:w-1/2 flex flex-col">
            <h3 className="text-2xl font-bold text-charcoal-gray mb-2 group-hover:text-tropical-green transition-colors">{post.title}</h3>
            <p className="text-sm text-gray-500 mb-2">By {post.author} on {post.date}</p>
            <p className="text-gray-700 leading-relaxed font-noto-sans flex-grow">{post.excerpt}</p>
            <a href="#" className="font-semibold text-ocean-blue hover:underline mt-4 self-start">Read More &rarr;</a>
        </div>
    </div>
);

const NewsArticleCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-ocean-blue transition-shadow hover:shadow-xl">
        <h3 className="text-xl font-bold text-charcoal-gray mb-2">{article.title}</h3>
        <p className="text-gray-700 leading-relaxed mb-4 font-noto-sans whitespace-pre-wrap">{article.summary}</p>
        <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-ocean-blue hover:underline"
        >
            Read Full Story on {article.sourceTitle || 'Source'} &rarr;
        </a>
    </div>
);


const NewsPage: React.FC = () => {
    const { t } = useAppContext();
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getNewsAndBlog = async () => {
            try {
                const [fetchedNews, fetchedBlogPosts] = await Promise.all([
                    fetchCommunityNews(),
                    getBlogPosts(),
                ]);
                setNews(fetchedNews);
                setBlogPosts(fetchedBlogPosts);
            } catch (err) {
                setError('Failed to load content. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        getNewsAndBlog();
    }, []);

    return (
        <div className="bg-sandy-beige min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-charcoal-gray">{t('news')} & Updates</h1>
                    <p className="mt-2 text-lg text-gray-600 font-noto-sans">Your source for what's happening in and around Gros-Islet.</p>
                </div>

                {isLoading && <Spinner />}
                {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}
                
                {!isLoading && !error && (
                    <>
                        {/* Blog Section */}
                        {blogPosts.length > 0 && (
                            <div className="mb-16">
                                <h2 className="text-3xl font-bold text-center text-charcoal-gray mb-8">From the GIBD Blog</h2>
                                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                                    {blogPosts.map(post => <BlogPostCard key={post.id} post={post} />)}
                                </div>
                            </div>
                        )}

                        {/* News Section */}
                        <div className="border-t-2 border-gray-200 pt-16">
                             <h2 className="text-3xl font-bold text-center text-charcoal-gray mb-8">Latest Community News</h2>
                            {news.length > 0 ? (
                                <div className="max-w-4xl mx-auto space-y-8">
                                    {news.map((article, index) => (
                                        <NewsArticleCard key={index} article={article} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                                    <p className="text-xl text-gray-600">No recent news found from official sources.</p>
                                    <p className="text-sm text-gray-400 mt-2">Please check back later for updates.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsPage;