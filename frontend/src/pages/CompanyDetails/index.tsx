import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFramework } from '../../context/FrameworkContext';
import { Company } from '../../types';

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { companies } = useFramework();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        
        const foundCompany = companies.find(c => c.id === id);
        
        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          const response = await fetch(`http://localhost:8000/api/companies/${id}`);
          const data = await response.json();
          setCompany(data);
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, companies]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Company not found</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>The company you're looking for doesn't exist or has been removed.</p>
          </div>
          <div className="mt-5">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">{company.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {company.focusArea} | Founded {company.foundingYear}
          </p>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Score:</span>
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm font-medium">
            {company.score}/100
          </span>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.location}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Website</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                {company.websiteUrl}
              </a>
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Funding</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.fundingAmount}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Investors</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {company.investors && company.investors.length > 0 ? (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {company.investors.map((investor, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      {investor}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">No investors listed</span>
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">News Headlines</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {company.newsHeadlines && company.newsHeadlines.length > 0 ? (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {company.newsHeadlines.map((headline, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      {headline}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">No news headlines available</span>
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Discovery Information</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>Discovered by: <span className="font-medium">{company.discoveredBy}</span></p>
              <p>Discovered at: <span className="font-medium">{company.discoveredAt ? new Date(company.discoveredAt).toLocaleString() : 'N/A'}</span></p>
            </dd>
          </div>
        </dl>
      </div>
      {company.isPublic && company.stockPrice && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Stock Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current market data for {company.name} ({company.stockSymbol})
            </p>
          </div>
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Stock Symbol</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.stockSymbol}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {company.stockPrice.currentPrice !== undefined ? `$${company.stockPrice.currentPrice.toFixed(2)}` : 'N/A'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Change</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={(company.stockPrice.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {(company.stockPrice.change || 0) >= 0 ? '+' : ''}{company.stockPrice.change?.toFixed(2) || '0.00'} 
                  ({(company.stockPrice.change || 0) >= 0 ? '+' : ''}{company.stockPrice.changePercent?.toFixed(2) || '0.00'}%)
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Market Cap</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {company.stockPrice.marketCap || 'N/A'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {company.stockPrice.lastUpdated ? new Date(company.stockPrice.lastUpdated).toLocaleString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      )}
      <div className="px-4 py-5 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default CompanyDetails;
