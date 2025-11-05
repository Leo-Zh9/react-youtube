import express from 'express';
import Video from '../models/Video.js';

const router = express.Router();

// Helper function to parse view counts to numbers for sorting
const parseViewCount = (viewString) => {
  if (!viewString || viewString === '0') return 0;
  
  const str = viewString.toLowerCase();
  const num = parseFloat(str);
  
  if (str.includes('k')) return num * 1000;
  if (str.includes('m')) return num * 1000000;
  if (str.includes('b')) return num * 1000000000;
  
  return parseInt(viewString) || 0;
};

// GET /api/videos/search - Search and filter videos
router.get('/', async (req, res) => {
  try {
    const {
      q = '',           // Search query
      category = '',    // Category filter
      year = '',        // Year filter
      sort = 'createdAt', // Sort by: 'views', 'createdAt', 'relevance'
      page = 1,         // Page number
      limit = 20        // Results per page
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    let sortOptions = {};

    // Text search if query provided
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
      
      // If using text search, default to relevance sort
      if (sort === 'relevance' || sort === 'createdAt') {
        sortOptions = { score: { $meta: 'textScore' }, createdAt: -1 };
      }
    }

    // Category filter
    if (category && category.trim()) {
      query.category = category.trim();
    }

    // Year filter
    if (year && year.trim()) {
      query.year = year.trim();
    }

    // Build aggregation pipeline
    let pipeline = [];

    // Match stage
    if (Object.keys(query).length > 0) {
      if (query.$text) {
        pipeline.push({
          $match: query
        });
        // Add text score
        pipeline.push({
          $addFields: {
            score: { $meta: 'textScore' }
          }
        });
      } else {
        pipeline.push({ $match: query });
      }
    }

    // Add numeric views field for sorting
    pipeline.push({
      $addFields: {
        viewsNumeric: {
          $let: {
            vars: {
              viewStr: { $toLower: '$views' }
            },
            in: {
              $cond: {
                if: { $regexMatch: { input: '$$viewStr', regex: 'k' } },
                then: {
                  $multiply: [
                    { $toDouble: { $replaceAll: { input: '$$viewStr', find: 'k', replacement: '' } } },
                    1000
                  ]
                },
                else: {
                  $cond: {
                    if: { $regexMatch: { input: '$$viewStr', regex: 'm' } },
                    then: {
                      $multiply: [
                        { $toDouble: { $replaceAll: { input: '$$viewStr', find: 'm', replacement: '' } } },
                        1000000
                      ]
                    },
                    else: {
                      $cond: {
                        if: { $regexMatch: { input: '$$viewStr', regex: 'b' } },
                        then: {
                          $multiply: [
                            { $toDouble: { $replaceAll: { input: '$$viewStr', find: 'b', replacement: '' } } },
                            1000000000
                          ]
                        },
                        else: { $toDouble: { $ifNull: ['$views', 0] } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Sorting
    if (sort === 'views') {
      pipeline.push({ $sort: { viewsNumeric: -1, createdAt: -1 } });
    } else if (sort === 'relevance' && q && q.trim()) {
      pipeline.push({ $sort: sortOptions });
    } else {
      // Default: sort by createdAt
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Count total results
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Video.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Execute aggregation
    const videos = await Video.aggregate(pipeline);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);

    console.log(`🔍 Search: q="${q}", category="${category}", year="${year}", sort="${sort}" - Found ${total} results`);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      filters: {
        query: q || null,
        category: category || null,
        year: year || null,
        sort: sort || 'createdAt',
      },
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching videos',
      error: error.message,
    });
  }
});

// GET /api/videos/search/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    // Get unique categories
    const categories = await Video.distinct('category');
    
    // Get unique years
    const years = await Video.distinct('year');
    
    // Sort years in descending order
    years.sort((a, b) => {
      const yearA = parseInt(a) || 0;
      const yearB = parseInt(b) || 0;
      return yearB - yearA;
    });

    res.status(200).json({
      success: true,
      data: {
        categories: categories.filter(c => c && c.trim()).sort(),
        years: years.filter(y => y && y.trim()),
        sortOptions: [
          { value: 'createdAt', label: 'Latest' },
          { value: 'views', label: 'Most Viewed' },
          { value: 'relevance', label: 'Relevance' },
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filters',
      error: error.message,
    });
  }
});

export default router;

