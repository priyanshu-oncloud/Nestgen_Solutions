import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  ref,
  push,
  onValue,
  update,
  remove,
} from "firebase/database";
import { database } from "@/firebase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

const ManageTeam = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<TeamMember>({
    id: "",
    name: "",
    role: "",
    bio: "",
    imageUrl: "",
  });

  const { toast } = useToast();

  /* 🔄 Fetch Team (Realtime) */
  useEffect(() => {
    const teamRef = ref(database, "team");

    return onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTeam([]);
        return;
      }

      const list: TeamMember[] = Object.entries(data).map(
        ([id, value]: any) => ({
          id,
          ...value,
        })
      );

      setTeam(list.reverse());
    });
  }, []);

  /* ➕➖ Save / Update */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (current.id) {
        // Update
        await update(ref(database, `team/${current.id}`), {
          name: current.name,
          role: current.role,
          bio: current.bio,
          imageUrl: current.imageUrl,
        });

        toast({ title: "Team member updated" });
      } else {
        // Add
        await push(ref(database, "team"), {
          name: current.name,
          role: current.role,
          bio: current.bio,
          imageUrl: current.imageUrl,
          createdAt: Date.now(),
        });

        toast({ title: "Team member added" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  /* ✏ Edit */
  const handleEdit = (member: TeamMember) => {
    setCurrent(member);
    setIsEditing(true);
  };

  /* 🗑 Delete */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;

    await remove(ref(database, `team/${id}`));
    toast({ title: "Team member deleted" });
  };

  const resetForm = () => {
    setCurrent({
      id: "",
      name: "",
      role: "",
      bio: "",
      imageUrl: "",
    });
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Team</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          )}
        </div>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>
                {current.id ? "Edit Team Member" : "Add Team Member"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={current.name}
                    onChange={(e) =>
                      setCurrent({ ...current, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Input
                    value={current.role}
                    onChange={(e) =>
                      setCurrent({ ...current, role: e.target.value })
                    }
                    placeholder="e.g., CEO, CTO, Developer"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={current.bio}
                    onChange={(e) =>
                      setCurrent({ ...current, bio: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={current.imageUrl}
                    onChange={(e) =>
                      setCurrent({ ...current, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {member.imageUrl && (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <p className="text-sm text-muted-foreground">
                  {member.bio}
                </p>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};

export default ManageTeam;
