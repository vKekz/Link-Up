import { ApiController } from "../api-controller";

/**
 * Repräsentiert den Controller, der für die Gruppenoperationen verwendet wird.
 */
export class GroupController extends ApiController {
  /**
   * Holt alle Gruppen, denen ein Benutzer beigetreten ist.
   * 
   * @param userId Die ID des Benutzers
   */
  public async getUserGroups(userId: string) {
    const { data, error } = await this.supabaseClient
      .from('groups')
      .select('*')
      .contains('members', [userId]);
    
    if (error) {
      console.error('Fehler beim Abrufen der Gruppen:', error);
      return { groups: [], error: error.message };
    }
    
    return { groups: data || [], error: null };
  }

  /**
   * Erstellt eine neue Gruppe.
   * 
   * @param name Der Name der Gruppe
   * @param description Die Beschreibung der Gruppe
   * @param creatorId Die ID des Erstellers
   */
  public async createGroup(name: string, description: string, creatorId: string) {
    const { data, error } = await this.supabaseClient
      .from('groups')
      .insert([
        { 
          name, 
          description, 
          creator_id: creatorId,
          members: [creatorId],
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Fehler beim Erstellen der Gruppe:', error);
      return { group: null, error: error.message };
    }
    
    return { group: data ? data[0] : null, error: null };
  }

  /**
   * Einer Gruppe beitreten.
   * 
   * @param groupId Die ID der Gruppe
   * @param userId Die ID des Benutzers
   */
  public async joinGroup(groupId: number, userId: string) {
    // Zuerst die aktuelle Gruppe abrufen
    const { data: group, error: fetchError } = await this.supabaseClient
      .from('groups')
      .select('members')
      .eq('id', groupId)
      .single();
    
    if (fetchError) {
      console.error('Fehler beim Abrufen der Gruppe:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Überprüfen, ob der Benutzer bereits Mitglied ist
    const members = group.members || [];
    if (members.includes(userId)) {
      return { success: false, error: 'Benutzer ist bereits Mitglied dieser Gruppe' };
    }
    
    // Benutzer zur Gruppe hinzufügen
    const updatedMembers = [...members, userId];
    const { error: updateError } = await this.supabaseClient
      .from('groups')
      .update({ members: updatedMembers })
      .eq('id', groupId);
    
    if (updateError) {
      console.error('Fehler beim Beitreten der Gruppe:', updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true, error: null };
  }
  
  /**
   * Eine Gruppe verlassen.
   * 
   * @param groupId Die ID der Gruppe
   * @param userId Die ID des Benutzers
   */
  public async leaveGroup(groupId: number, userId: string) {
    // Zuerst die aktuelle Gruppe abrufen
    const { data: group, error: fetchError } = await this.supabaseClient
      .from('groups')
      .select('members, creator_id')
      .eq('id', groupId)
      .single();
    
    if (fetchError) {
      console.error('Fehler beim Abrufen der Gruppe:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Überprüfen, ob der Benutzer der Ersteller ist
    if (group.creator_id === userId) {
      return { success: false, error: 'Der Ersteller kann die Gruppe nicht verlassen' };
    }
    
    // Benutzer aus der Gruppe entfernen
    const members = group.members || [];
    const updatedMembers = members.filter((id: string) => id !== userId);
    
    const { error: updateError } = await this.supabaseClient
      .from('groups')
      .update({ members: updatedMembers })
      .eq('id', groupId);
    
    if (updateError) {
      console.error('Fehler beim Verlassen der Gruppe:', updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true, error: null };
  }
}
