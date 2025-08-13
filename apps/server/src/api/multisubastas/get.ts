import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

/**
 * Get all active multisubastas
 * @route GET /api/multisubastas
 */
export const getMultisubastas = async (req: Request, res: Response) => {
  try {
    const multisubastas = await prisma.multisubasta.findMany({
      where: {
        status: 'active',
        endTime: {
          gte: new Date()
        }
      },
      include: {
        items: {
          include: {
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include userName in comments
    const transformedMultisubastas = multisubastas.map((multisubasta: any) => {
      return {
        ...multisubasta,
        items: multisubasta.items.map((item: any) => {
          return {
            ...item,
            comments: item.comments.map((comment: any) => {
              return {
                ...comment,
                userName: comment.user.name
              };
            })
          };
        })
      };
    });

    res.status(200).json(transformedMultisubastas);
  } catch (error) {
    console.error('Error fetching multisubastas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};