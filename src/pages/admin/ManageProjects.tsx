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

const ManageProjects = () => {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [current, setCurrent] = useState<Project>({
    id: "",
    title: "",
    description: "",
    category: "",
    industry: "",
    techStack: "",
    result: "",
    images: [],
  });

  /* 🔄 Fetch Projects */
  useEffect(() => {
    const projectsRef = ref(database, "projects");
    return onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setProjects([]);

      const list = Object.entries(data).map(([id, val]: any) => ({
        id,
        ...val,
        images: val.images || [],
      }));

      setProjects(list.reverse());
    });
  }, []);

  /* 📤 Upload Images */
  const uploadImages = async (projectId: string) => {
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

  /* 💾 Save */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (current.id) {
        let imageUrls = current.images;

        if (files.length) {
          const newUrls = await uploadImages(current.id);
          imageUrls = [...imageUrls, ...newUrls];
        }

        await update(ref(database, `projects/${current.id}`), {
          ...current,
          images: imageUrls,
        });

        toast({ title: "Project updated" });
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

        if (files.length) {
          const urls = await uploadImages(projectRef.key!);
          await update(ref(database, `projects/${projectRef.key}`), {
            images: urls,
          });
        }

        toast({ title: "Project added" });
      }

      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (project: Project) => {
    setCurrent(project);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete project?")) return;
    await remove(ref(database, `projects/${id}`));
    toast({ title: "Project deleted" });
  };

  const resetForm = () => {
    setCurrent({
      id: "",
      title: "",
      description: "",
      category: "",
      industry: "",
      techStack: "",
      result: "",
      images: [],
    });
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
              <CardTitle>{current.id ? "Edit" : "Add"} Project</CardTitle>
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
                    value={current.description}
                    onChange={(e) =>
                      setCurrent({ ...current, description: e.target.value })
                    }
                    rows={3}
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
                      placeholder="Web, Mobile, Cloud, AI/ML"
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
                    placeholder="React, Node.js, AWS..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Result</label>
                  <Textarea
                    value={current.result}
                    onChange={(e) =>
                      setCurrent({ ...current, result: e.target.value })
                    }
                    rows={2}
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

                {/* Existing Images */}
                {current.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {current.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="h-24 w-full object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button variant="outline" onClick={resetForm}>
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
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <p className="text-sm">{p.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
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
