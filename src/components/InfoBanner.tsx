'use client';

export default function InfoBanner({ variant = 'loggedIn' }: { variant?: 'loggedIn' | 'loggedOut' }) {
  if (variant === 'loggedOut') {
    return (
      <div className="bg-white border border-blue-100 rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-6 w-6 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Join the conversation!
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start text-gray-700">
            <svg className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Sign in to create and share your ideal batting order</span>
          </li>
          <li className="flex items-start text-gray-700">
            <svg className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>Vote on other batting orders</span>
          </li>
          <li className="flex items-start text-gray-700">
            <svg className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Participate in discussions</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-100 rounded-lg p-6 mb-8 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="h-6 w-6 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Here's what you can do:
      </h3>
      <ul className="space-y-4">
        <li className="flex items-start text-gray-700">
          <svg className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Edit your submitted batting order anytime</span>
        </li>
        <li className="flex items-start text-gray-700">
          <svg className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Cast only 1 upvote and downvote on other submissions, you can change your vote anytime</span>
        </li>
        <li className="flex items-start text-gray-700">
          <svg className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Add comments to any batting order (note: comments are not anonymous)</span>
        </li>
      </ul>
    </div>
  );
}