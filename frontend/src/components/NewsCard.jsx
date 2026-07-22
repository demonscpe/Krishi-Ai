import React from 'react';

const Card = ({ article }) => {
  const { title, description, url, urlToImage, source } = article;
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full font-poppins">
      <div className="overflow-hidden h-44 bg-gray-100 flex-shrink-0">
        <img
          src={urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        {source?.name && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2 font-roboto">
            {source.name}
          </span>
        )}
        <h3 className="text-sm font-bold text-slate-800 leading-snug mb-2 line-clamp-2">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed flex-grow line-clamp-3">
          {description || 'No description available.'}
        </p>
        <a
          href={url} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-4 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
};

export default Card;
