import roomReducer, { addUser, selectCardForCurrentUser, updateUserName, revealAll, resetTable } from '../roomSlice'

describe('roomSlice reducer', () => {
  it('adds a user', () => {
    const initial = { hand: [], users: [], currentUserId: null, revealed: false, history: [] }
    const st = roomReducer(initial, addUser('Alice'))
    expect(st.users.length).toBe(1)
    expect(st.users[0].name).toBe('Alice')
    expect(st.currentUserId).toBeDefined()
  })

  it('updates user name', () => {
    const initial = { hand: [], users: [{ id: 'u1', name: 'Old', card: null }], currentUserId: 'u1', revealed: false, history: [] }
    const st = roomReducer(initial, updateUserName({ id: 'u1', name: 'New' }))
    expect(st.users[0].name).toBe('New')
  })

  it('selects card for current user and sim selects', () => {
    const initial = { hand: [1,2,3], users: [{id:'me',name:'You',card:null},{id:'sim',name:'Sim',card:null}], currentUserId:'me', revealed:false, history:[] }
    const st = roomReducer(initial, selectCardForCurrentUser(2))
    const me = st.users.find(u=>u.id==='me')
    const sim = st.users.find(u=>u.id==='sim')
    expect(me.card).toBe(2)
    expect(sim.card).not.toBeNull()
    expect(sim.card).not.toBe(2)
  })

  it('revealAll pushes history and resetTable clears cards', () => {
    const initial = { hand: [], users: [{id:'me',name:'You',card:3}], currentUserId:'me', revealed:false, history:[] }
    const revealed = roomReducer(initial, revealAll())
    expect(revealed.revealed).toBe(true)
    expect(revealed.history.length).toBe(1)
    const reset = roomReducer(revealed, resetTable())
    expect(reset.users[0].card).toBeNull()
    expect(reset.revealed).toBe(false)
  })
})
