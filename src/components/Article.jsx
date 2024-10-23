import React from 'react';

function Article({ val, valName, metaVal }) {
  return (
    <div>
      <article className="flex items-end justify-between rounded-lg border border-gray-300 bg-white p-6">
        <div>
          <p className="text-md font-semibold text-gray-800">{valName}</p>

          <p className="text-2xl font-medium text-gray-900">{val}</p>
        </div>

        <div
          className={`inline-flex gap-2 rounded p-1 ${
            metaVal > 0
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {metaVal > 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v9m0-8l-8 8-4-4-6 6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          )}

          <span className="text-xs font-medium">{metaVal} </span>
        </div>
      </article>
    </div>
  );
}

export default Article;
