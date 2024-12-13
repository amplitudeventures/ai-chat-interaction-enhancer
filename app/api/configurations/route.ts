import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/auth-config'
import { assistants, agents } from '@/lib/data/ai-entities';
import { EntityType, AIEntityStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { entities } = await req.json()
    
    // Verify entities exist in our static data
    const allEntities = [...assistants, ...agents];
    const validEntities = entities.filter((e: { id: string }) => 
      allEntities.some(staticEntity => staticEntity.id === e.id)
    );

    if (validEntities.length !== entities.length) {
      const invalidIds = entities
        .filter((e: { id: string }) => !allEntities.some(staticEntity => staticEntity.id === e.id))
        .map((e: { id: string }) => e.id);
      
      return new Response(JSON.stringify({ 
        error: 'Some entities are not valid',
        invalidIds 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // First create the AI entities
    await Promise.all(
      validEntities.map(async (entity: { id: string }) => {
        const entityData = allEntities.find(e => e.id === entity.id)!;
        return prisma.aIEntity.upsert({
          where: { id: entityData.id },
          create: {
            id: entityData.id,
            type: entityData.type === 'assistant' ? 'ASSISTANT' : 'AGENT',
            icon: entityData.icon,
            name: entityData.name,
            description: entityData.description,
            status: 'ACTIVE',
            statusMessage: entityData.statusMessage,
            order: entityData.order,
            initialPrompt: entityData.initial_prompt,
            guidance: entityData.guidance,
          },
          update: {}
        });
      })
    );

    // Then create the user configurations
    const configurations = await Promise.all(
      validEntities.map((entity: { id: string }) => 
        prisma.userConfiguration.create({
          data: {
            userId: session.user.id,
            entityId: entity.id
          }
        })
      )
    );

    return new Response(JSON.stringify({ success: true, configurations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Configuration creation failed:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to save configuration',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch user's configurations from the database
    const configurations = await prisma.userConfiguration.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        entity: true // Include the related AIEntity data
      }
    });

    return new Response(JSON.stringify({ configurations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Configuration fetch failed:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch configurations',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
