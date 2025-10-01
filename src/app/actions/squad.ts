"use server"

import { createClient } from "@/lib/supabase/server"

export async function createSquad(creatorId: string, memberIds: string[], course: string, name?: string) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== creatorId) {
      return { success: false, error: "Unauthorized" }
    }

    // Get creator's profile
    const { data: creatorProfile } = await supabase
      .from("profile")
      .select("first_name, last_name")
      .eq("id", creatorId)
      .single()

    // Create squad with pending status
    const squadName = name || `${course} Study Squad`
    const { data: squad, error: squadError } = await supabase
      .from("squad")
      .insert({
        name: squadName,
        description: `Study group for ${course}`,
        course: course,
        creator_id: creatorId,
        status: "pending",
        visibility: "closed",
      })
      .select()
      .single()

    if (squadError || !squad) {
      console.error("[v0] Error creating squad:", squadError)
      return { success: false, error: "Failed to create squad" }
    }

    // Add creator as a member
    const { error: creatorMemberError } = await supabase.from("member").insert({
      squad_id: squad.id,
      user_id: creatorId,
    })

    if (creatorMemberError) {
      console.error("[v0] Error adding creator as member:", creatorMemberError)
      // Clean up squad
      await supabase.from("squad").delete().eq("id", squad.id)
      return { success: false, error: "Failed to add creator to squad" }
    }

    // Create invitations for all selected members
    const invitations = memberIds.map((memberId) => ({
      squad_id: squad.id,
      inviter_id: creatorId,
      invitee_id: memberId,
      status: "pending",
    }))

    const { error: invitationError } = await supabase.from("invitation").insert(invitations)

    if (invitationError) {
      console.error("[v0] Error creating invitations:", invitationError)
      // Clean up squad
      await supabase.from("squad").delete().eq("id", squad.id)
      return { success: false, error: "Failed to send invitations" }
    }

    return {
      success: true,
      data: {
        squadId: squad.id,
        squadName: squad.name,
        invitationCount: memberIds.length,
      },
    }
  } catch (error) {
    console.error("[v0] Error creating squad:", error)
    return { success: false, error: "Failed to create squad" }
  }
}

export async function getPendingInvitations(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("invitation")
      .select(
        `
        *,
        squad:squad_id (
          id,
          name,
          description,
          course,
          created_at
        ),
        inviter:inviter_id (
          first_name,
          last_name,
          zid
        )
      `,
      )
      .eq("invitee_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching invitations:", error)
      return { success: false, error: "Failed to fetch invitations" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error fetching invitations:", error)
    return { success: false, error: "Failed to fetch invitations" }
  }
}

export async function respondToInvitation(invitationId: number, userId: string, accept: boolean) {
  try {
    const supabase = await createClient()

    // Verify user owns this invitation
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Get invitation details
    const { data: invitation, error: invError } = await supabase
      .from("invitation")
      .select("*, squad:squad_id(*)")
      .eq("id", invitationId)
      .eq("invitee_id", userId)
      .single()

    if (invError || !invitation) {
      return { success: false, error: "Invitation not found" }
    }

    if (accept) {
      // Update invitation status
      const { error: updateError } = await supabase
        .from("invitation")
        .update({ status: "accepted" })
        .eq("id", invitationId)

      if (updateError) {
        console.error("[v0] Error accepting invitation:", updateError)
        return { success: false, error: "Failed to accept invitation" }
      }

      // Add user as member
      const { error: memberError } = await supabase.from("member").insert({
        squad_id: invitation.squad_id,
        user_id: userId,
      })

      if (memberError) {
        console.error("[v0] Error adding member:", memberError)
        return { success: false, error: "Failed to join squad" }
      }

      // Check if all invitations are accepted
      const { data: allInvitations } = await supabase
        .from("invitation")
        .select("status")
        .eq("squad_id", invitation.squad_id)

      const allAccepted = allInvitations?.every((inv) => inv.status === "accepted")

      if (allAccepted) {
        // Activate the squad
        await supabase.from("squad").update({ status: "active" }).eq("id", invitation.squad_id)
      }

      return { success: true, message: "Invitation accepted" }
    } else {
      // Decline invitation
      const { error: updateError } = await supabase
        .from("invitation")
        .update({ status: "declined" })
        .eq("id", invitationId)

      if (updateError) {
        console.error("[v0] Error declining invitation:", updateError)
        return { success: false, error: "Failed to decline invitation" }
      }

      // Cancel the squad if anyone declines
      await supabase.from("squad").update({ status: "pending" }).eq("id", invitation.squad_id)

      return { success: true, message: "Invitation declined" }
    }
  } catch (error) {
    console.error("[v0] Error responding to invitation:", error)
    return { success: false, error: "Failed to respond to invitation" }
  }
}

export async function getUserSquads(userId: string) {
  try {
    const supabase = await createClient()

    // Get squads where user is a member
    const { data: memberData, error: memberError } = await supabase
      .from("member")
      .select(
        `
        squad:squad_id (
          id,
          name,
          description,
          course,
          status,
          visibility,
          created_at,
          creator:creator_id (
            first_name,
            last_name
          )
        )
      `,
      )
      .eq("user_id", userId)

    if (memberError) {
      console.error("[v0] Error fetching squads:", memberError)
      return { success: false, error: "Failed to fetch squads" }
    }

    // Extract squads from the nested structure
    const squads = memberData?.map((m: any) => m.squad).filter(Boolean) || []

    return { success: true, data: squads }
  } catch (error) {
    console.error("[v0] Error fetching squads:", error)
    return { success: false, error: "Failed to fetch squads" }
  }
}

export async function getSquadDetails(squadId: number, userId: string) {
  try {
    const supabase = await createClient()

    // Get squad details
    const { data: squad, error: squadError } = await supabase
      .from("squad")
      .select(
        `
        *,
        creator:creator_id (
          first_name,
          last_name,
          zid
        )
      `,
      )
      .eq("id", squadId)
      .single()

    if (squadError || !squad) {
      return { success: false, error: "Squad not found" }
    }

    // Get members
    const { data: members, error: membersError } = await supabase
      .from("member")
      .select(
        `
        *,
        profile:user_id (
          id,
          first_name,
          last_name,
          zid,
          degree,
          profile_url
        )
      `,
      )
      .eq("squad_id", squadId)

    if (membersError) {
      console.error("[v0] Error fetching members:", membersError)
      return { success: false, error: "Failed to fetch members" }
    }

    // Get pending invitations
    const { data: invitations } = await supabase
      .from("invitation")
      .select(
        `
        *,
        invitee:invitee_id (
          first_name,
          last_name,
          zid
        )
      `,
      )
      .eq("squad_id", squadId)
      .eq("status", "pending")

    return {
      success: true,
      data: {
        squad,
        members: members?.map((m: any) => m.profile).filter(Boolean) || [],
        pendingInvitations: invitations || [],
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching squad details:", error)
    return { success: false, error: "Failed to fetch squad details" }
  }
}
