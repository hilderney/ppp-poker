#!/usr/bin/env node

/**
 * Test script to verify the server initialization
 */

async function testServerInitialization() {
  try {
    console.log('Testing server initialization...')
    console.log('Importing modules...')
    
    const { createRoomService } = await import('./server/services/roomServiceFactory.js')
    const { createDatabaseAdapter } = await import('./server/infrastructure/adapters/database/index.js')
    const { RoomRepository } = await import('./server/infrastructure/repositories/RoomRepository.js')
    
    console.log('✓ All modules imported successfully')
    
    console.log('\nTesting MockAdapter...')
    const mockAdapter = createDatabaseAdapter('mock')
    console.log('✓ MockAdapter created')
    
    console.log('\nTesting RoomRepository...')
    const repo = new RoomRepository(mockAdapter)
    console.log('✓ RoomRepository created')
    
    console.log('\nTesting RoomService factory...')
    const roomService = await createRoomService('mock')
    console.log('✓ RoomService created with MockAdapter')
    console.log(`  └─ RoomService has roomRepository: ${!!roomService.roomRepository}`)
    
    console.log('\n✅ All initialization tests passed!')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Initialization test failed:')
    console.error(err)
    process.exit(1)
  }
}

testServerInitialization()
