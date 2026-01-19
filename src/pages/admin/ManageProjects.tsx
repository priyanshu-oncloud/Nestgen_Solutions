import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  ref,
  push,
  onValue,
  update,
  remove,
  Unsubscribe,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { database, storage } from "@/firebase";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  techStack: string;
  result: string;
  images: string[];
}

const emptyProject: Project = {
  id: "",
  title: "",
  description: "",
  category: "",
  industry: "",
  techStack: "",
  result: "",
  images: [],
};

const ManageProjects = () => {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [current, setCurrent] = useState<Project>(emptyProject);

  /* 🔄 Fetch Projects */
  useEffect(() => {
    const projectsRef = ref(database, "projects");

    const unsubscribe: Unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setProjects([]);
        return;
      }

      const list: Project[] = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          title: value.title,
          description: value.description,
          category: value.category,
          industry: value.industry,
          techStack: value.techStack,
          result: value.result,
          images: value.images || [],
        })
      );

      setProjects(list.reverse());
    });

    return () => unsubscribe();
  }, []);

  /* 📤 Upload Images */
  const uploadImages = async (projectId: string): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of files) {
      const imgRef = storageRef(
        storage,
        `project-images/${projectId}/${Date.now()}-${file.name}`
      );

      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);
      urls.push(url);
    }

    return urls;
  };

  /* 💾 Save Project */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (current.id) {
        let imageUrls = [...current.images];

        if (files.length > 0) {
          const newUrls = await uploadImages(current.id);
          imageUrls = imageUrls.concat(newUrls);
        }

        await update(ref(database, `projects/${current.id}`), {
          title: current.title,
          description: current.description,
          category: current.category,
          industry: current.industry,
          techStack: current.techStack,
          result: current.result,
          images: imageUrls,
          updatedAt: Date.now(),
        });

        toast({ title: "Project updated successfully" });
      } else {
        const projectRef = await push(ref(database, "projects"), {
          title: current.title,
          description: current.description,
          category: current.category,
          industry: current.industry,
          techStack: current.techStack,
          result: current.result,
          images: [],
          createdAt: Date.now(),
        });

        if (files.length > 0 && projectRef.key) {
          const urls = await uploadImages(projectRef.key);
          await update(ref(database, `projects/${projectRef.key}`), {
            images: urls,
          });
        }

        toast({ title: "Project added successfully" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Project save failed",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (project: Project) => {
    setCurrent(project);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;

    await remove(ref(database, `projects/${id}`));
    toast({ title: "Project deleted" });
  };

  const resetForm = () => {
    setCurrent(emptyProject);
    setFiles([]);
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Projects</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          )}
        </div>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>
                {current.id ? "Edit Project" : "Add Project"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={current.title}
                    onChange={(e) =>
                      setCurrent({ ...current, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    rows={3}
                    value={current.description}
                    onChange={(e) =>
                      setCurrent({ ...current, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={current.category}
                      onChange={(e) =>
                        setCurrent({ ...current, category: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Industry</label>
                    <Input
                      value={current.industry}
                      onChange={(e) =>
                        setCurrent({ ...current, industry: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Tech Stack</label>
                  <Input
                    value={current.techStack}
                    onChange={(e) =>
                      setCurrent({ ...current, techStack: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Result</label>
                  <Textarea
                    rows={2}
                    value={current.result}
                    onChange={(e) =>
                      setCurrent({ ...current, result: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Images</label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setFiles(Array.from(e.target.files || []))
                    }
                  />
                </div>

                {current.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {current.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Project"
                        className="h-24 w-full object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {p.category} • {p.industry}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.images[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <p className="text-sm">{p.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(p)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(p.id)}
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

export default ManageProjects;
