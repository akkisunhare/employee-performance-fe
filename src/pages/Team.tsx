"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
import { PlusCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/axios";
import { TeamService, CreateTeamDto, UpdateTeamDto } from "@/services/teams";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Team {
  _id: string;
  name: string;
  createdBy: string;
  owner: {
    id: string;
    name: string;
    _id: string;
  };
  memberIds: User[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function TeamsPage() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    owner: { id: "", name: "" },
    memberIds: [] as string[],
  });
  const [selectedMembers, setSelectedMembers] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(()=> {
    if(!dialogOpen){
      setSelectedMembers([]);
      setNewTeam({
        name: "",
        owner: { id: "", name: "" },
        memberIds: [],
      });

    }
  },[dialogOpen])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsResponse:any = await TeamService.getTeams();
        if (teamsResponse.success) {
          setTeams(teamsResponse.data);
        } else {
          toast({
            title: "Error",
            description: teamsResponse.message,
            variant: "destructive",
          });
        }

        const usersResponse = await axiosInstance.get("/users");
        setUsers(usersResponse.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z0-9 _\-']/g, "").replace(/\s+/g, " ").replace(/'/g, (_, offset, str) => {
      return (str.slice(0, offset).match(/'/g) || []).length < 2 ? "'" : "";
    });
    setNewTeam((prev) => ({
      ...prev,
      name: value,
    }));
  };
  const handleInputChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z0-9 _\-']/g, "").replace(/\s+/g, " ").replace(/'/g, (_, offset, str) => {
      return (str.slice(0, offset).match(/'/g) || []).length < 2 ? "'" : "";
    });
    setEditingTeam((prev) => ({
      ...prev,
      name: value,
    }));
  };

  const handleOwnerChange = (value: string) => {
    const selectedOwner = users.find((user) => user._id === value);
    if (selectedOwner) {
      setNewTeam((prev) => ({
        ...prev,
        owner: { id: selectedOwner._id, name: selectedOwner.name },
      }));
    }
  };

  const handleMembersChange = (selected: { id: string; name: string }[]) => {
    setSelectedMembers(selected);
    setNewTeam((prev) => ({
      ...prev,
      memberIds: selected.map((member) => member.id),
    }));
  };

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeamId((prevId) => (prevId === teamId ? null : teamId));
  };

  const openEditDialog = (team: Team) => {
    const memberObjects = team.memberIds.map((member) => ({
      id: member._id,
      name: member.name,
    }));

    setSelectedMembers(memberObjects);
    setEditingTeam(team);
    setEditDialogOpen(true);
  };

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.owner.id || newTeam.memberIds.length === 0) {
      toast({
        title: "Missing information",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }
        if (!newTeam.owner.id) {
      toast({
        title: "Missing information",
        description: "Please select a team owner",
        variant: "destructive",
      });
      return;
    }

    if (newTeam.memberIds.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one team member",
        variant: "destructive",
      });
      return;
    }

    try {
      const teamData: CreateTeamDto = {
        ...newTeam
      };

      const response = await TeamService.createTeam(teamData);
      
      if (response.success) {
        setTeams((prevTeams:any) => [...prevTeams, response.data]);
        setDialogOpen(false);
        setNewTeam({
          name: "",
          owner: { id: "", name: "" },
          memberIds: [],
        });
        setSelectedMembers([]);
        
        toast({
          title: "Team added",
          description: response.message,
        });
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const handleEditTeam = async () => {
    if (!editingTeam) return;

    if (!editingTeam.name || !editingTeam.owner.id || selectedMembers.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: UpdateTeamDto = {
        name: editingTeam.name,
        owner: editingTeam.owner,
        memberIds: selectedMembers.map(member => member.id),
      };

      const response:any = await TeamService.updateTeam(editingTeam._id, updateData);
      
      if (response.success) {
        setTeams((prevTeams) =>
          prevTeams.map((team) =>
            team._id === editingTeam._id ? response.data : team
          )
        );
        setEditDialogOpen(false);
        setEditingTeam(null);
        setSelectedMembers([]);
        
        toast({
          title: "Success",
          description: response.message,
        });
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive",
      });
    }
  };

  const userOptions = users.map((user) => ({
    id: user._id,
    name: user.name,
  }));

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedMembers([]);
  }

  return (
    <main className="min-h-screen w-full bg-black text-white px-0.5 py-2">
      <div className="w-fullmx-auto">
        <div className="bg-[#111111] rounded-lg p-4 mb-4 flex justify-between items-center">
          <h1 className="text-lg font-medium">Team</h1>
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              size="icon"
              className="bg-[#222222] border-none hover:bg-[#333333]"
            >
              <Filter className="h-4 w-4" />
            </Button> */}
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#222222] hover:bg-[#333333] text-white border-none"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No teams found. Add your first team to get started.
          </div>
        ) : (
          <div className="block min-h-[400px] h-[800px] overflow-y-scroll hide-scrollbar pb-10">
            <div className="space-y-2">
              {teams.map((team) => (
                <TeamRow
                  key={team._id}
                  team={team}
                  isExpanded={expandedTeamId === team._id}
                  onToggleExpand={() => toggleTeamExpand(team._id)}
                  onEdit={() => openEditDialog(team)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#111111] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add New Team
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={handleInputChange}
                className="bg-[#222222] border-gray-700"
                placeholder="Enter team name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner">Select Owner</Label>
              <Select onValueChange={handleOwnerChange}>
                <SelectTrigger className="bg-[#222222] border-gray-700 w-full">
                  <SelectValue placeholder="Select team owner" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="members">Select Members</Label>
              <MultiSelect
                options={userOptions}
                selected={selectedMembers}
                onChange={handleMembersChange}
                placeholder="Select team members"
                emptyMessage="No members found"
                className="bg-[#222222] border-gray-700 text-black"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              // onClick={() => setDialogOpen(false)}
              onClick={handleCancel}
              className="border-gray-700 text-white hover:bg-[#222222] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTeam}
              className="bg-white text-black hover:bg-gray-200"
            >
              Add Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#111111] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Team
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={editingTeam?.name || ""}
                onChange={handleInputChangeEdit}
                className="bg-[#222222] border-gray-700"
                placeholder="Enter team name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-owner">Select Owner</Label>
              <Select
                defaultValue={editingTeam?.owner.id}
                onValueChange={(value) => {
                  const selectedOwner = users.find(
                    (user) => user._id === value
                  );
                  if (selectedOwner && editingTeam) {
                    setEditingTeam({
                      ...editingTeam,
                      owner: {
                        id: selectedOwner._id,
                        name: selectedOwner.name,
                        _id: selectedOwner._id,
                      },
                    });
                  }
                }}
              >
                <SelectTrigger className="bg-[#222222] border-gray-700 w-full">
                  <SelectValue placeholder="Select team owner" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-members">Select Members</Label>
              <MultiSelect
                options={userOptions}
                selected={selectedMembers}
                onChange={(selected) => {
                  setSelectedMembers(selected);
                  // Don't update the memberIds in editingTeam here, we'll format it correctly in handleEditTeam
                }}
                placeholder="Select team members"
                emptyMessage="No members found"
                className="bg-[#222222] border-gray-700 text-black"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setEditDialogOpen(false)}
              className="border-gray-700 text-white hover:bg-[#222222] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTeam}
              className="bg-white text-black hover:bg-gray-200"
            >
              Update Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function TeamRow({
  team,
  isExpanded,
  onToggleExpand,
  onEdit,
}: {
  team: Team;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {

  const [userRole, setUserRole] = useState<any | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    try {
      const base64Url = token.split('.')[1]; // Get the payload part
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Convert Base64Url to standard Base64
      const decodedPayload = JSON.parse(atob(base64));
      setUserRole(decodedPayload?.role);
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  }, [])
  // console.log(userRole);
  
  return (
    <div className="bg-[#111111] rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h2 className="font-medium">{team.name}</h2>
          <p className="text-sm text-gray-400">
            Created On -{" "}
            {new Date(team.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "2-digit",
            })}{" "}
            • Owner: {team.owner.name}
          </p>
        </div>
        <div className="flex gap-2 items-center justify-center">
          {(userRole === "admin" || userRole === "organization_owner" || userRole === "manager") && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              >
              Edit
            </Button>
          )}
          <Button variant="secondary" size="icon" onClick={onToggleExpand}>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-800 bg-[#0a0a0a]">
          <h3 className="text-sm font-medium text-gray-400 my-2">
            Team Members
          </h3>
          {team.memberIds.length === 0 ? (
            <div className="text-sm text-gray-500 p-2">
              No team members found
            </div>
          ) : (
            <div className="space-y-2">
              {team.memberIds.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-md bg-[#161616]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">{member.name}</p>
                    {member._id === team.owner.id && (
                      <span className="text-xs text-gray-400">Team Owner</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
