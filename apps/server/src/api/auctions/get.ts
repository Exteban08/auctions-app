import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

/**
 * Get all active auctions
 * 
 * @route GET /api/auctions
 * @access Public
 */
export const getAuctions = async (req: Request, res: Response) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endTime: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        bids: {
          orderBy: {
            amount: 'desc'
          },
          take: 3,
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            bids: true
          }
        }
      },
      orderBy: {
        endTime: 'asc'
      }
    });

    // Format the auctions for the frontend
    const formattedAuctions = auctions.map(auction => {
      const currentBid = auction.bids[0]?.amount || auction.startingBid;
      
      // Calculate time remaining
      const now = new Date();
      const endTime = new Date(auction.endTime);
      const timeRemaining = endTime.getTime() - now.getTime();
      
      // Format time remaining
      let formattedTimeRemaining = '';
      if (timeRemaining <= 0) {
        formattedTimeRemaining = 'Finalizada';
      } else {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          formattedTimeRemaining = `${hours}h ${minutes}m`;
        } else {
          formattedTimeRemaining = `${minutes}m`;
        }
      }

      return {
        id: auction.id,
        title: auction.title,
        description: auction.description,
        image: auction.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
        price: currentBid,
        category: auction.category,
        endTime: formattedTimeRemaining,
        seller: auction.user.name,
        bidCount: auction._count.bids,
        bids: auction.bids.map(bid => ({
          userId: bid.user.id,
          userName: bid.user.name,
          amount: bid.amount
        }))
      };
    });

    return res.status(200).json(formattedAuctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return res.status(500).json({ message: 'Error fetching auctions' });
  }
};