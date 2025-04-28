import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { toast } from "react-toastify";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
  priority: "low" | "medium" | "high";
  category: Category | null;
  subtasks: Subtask[];
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Subtask {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  todo_id: string;
}

const STATUS_LABELS = {
  pending: "Aberto",
  in_progress: "Fazendo",
  completed: "Feito",
};

const PRIORITY_LABELS = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export default function IndexPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    status: "pending" as const,
    due_date: "",
    priority: "medium" as const,
    category_id: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#000000",
  });
  const [newSubtask, setNewSubtask] = useState({
    title: "",
    description: "",
    status: "pending" as "pending" | "in_progress" | "completed",
  });

  useEffect(() => {
    if (user?.id) {
      fetchTodos();
      fetchCategories();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select(
          `
          *,
          category:categories(*),
          subtasks:subtasks(*)
        `,
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleCreateTodo = async () => {
    try {
      const { error } = await supabase.from("todos").insert({
        title: newTodo.title,
        description: newTodo.description,
        status: newTodo.status,
        due_date: newTodo.due_date || null,
        priority: newTodo.priority,
        category_id: newTodo.category_id || null,
        user_id: user?.id,
      });

      if (error) throw error;

      setIsModalOpen(false);
      setNewTodo({
        title: "",
        description: "",
        status: "pending",
        due_date: "",
        priority: "medium",
        category_id: "",
      });
      fetchTodos();
      toast.success(`Tarefa "${newTodo.title}" criada com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast.error("Erro ao criar tarefa. Tente novamente.");
    }
  };

  const handleStatusChange = async (
    todoId: string,
    newStatus: Todo["status"],
  ) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus })
        .eq("id", todoId);

      if (error) throw error;
      fetchTodos();
      toast.success(`Tarefa movida para ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  const filteredTodos = (status: Todo["status"]) => {
    return todos.filter((todo) => todo.status === status);
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toISOString().split("T")[0];
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({
          title: editingTodo.title,
          description: editingTodo.description,
          status: editingTodo.status,
          due_date: editingTodo.due_date
            ? new Date(editingTodo.due_date).toISOString()
            : null,
          priority: editingTodo.priority,
          category_id: editingTodo.category?.id || null,
        })
        .eq("id", editingTodo.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setEditingTodo(null);
      fetchTodos();
      toast.success(`Tarefa "${editingTodo.title}" atualizada com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast.error("Erro ao atualizar tarefa. Tente novamente.");
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", todoId);

      if (error) throw error;

      setIsEditModalOpen(false);
      setEditingTodo(null);
      fetchTodos();
      toast.success("Tarefa excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa. Tente novamente.");
    }
  };

  const handleMoveTodo = async (
    todoId: string,
    currentStatus: Todo["status"],
  ) => {
    const statusOrder = ["pending", "in_progress", "completed"] as const;
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[currentIndex + 1] || statusOrder[0];

    try {
      const { error } = await supabase
        .from("todos")
        .update({ status: nextStatus })
        .eq("id", todoId);

      if (error) throw error;
      fetchTodos();
      toast.success(`Tarefa movida para ${STATUS_LABELS[nextStatus]}`);
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
      toast.error("Erro ao mover tarefa. Tente novamente.");
    }
  };

  const handleMoveBackTodo = async (
    todoId: string,
    currentStatus: Todo["status"],
  ) => {
    const statusOrder = ["pending", "in_progress", "completed"] as const;
    const currentIndex = statusOrder.indexOf(currentStatus);
    const prevStatus =
      statusOrder[currentIndex - 1] || statusOrder[statusOrder.length - 1];

    try {
      const { error } = await supabase
        .from("todos")
        .update({ status: prevStatus })
        .eq("id", todoId);

      if (error) throw error;
      fetchTodos();
      toast.success(`Tarefa movida para ${STATUS_LABELS[prevStatus]}`);
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
      toast.error("Erro ao mover tarefa. Tente novamente.");
    }
  };

  const handleCreateCategory = async () => {
    try {
      const { error } = await supabase.from("categories").insert({
        name: newCategory.name,
        color: newCategory.color,
        user_id: user?.id,
      });

      if (error) throw error;

      setIsCategoryModalOpen(false);
      setNewCategory({
        name: "",
        color: "#000000",
      });
      fetchCategories();
      toast.success(`Categoria "${newCategory.name}" criada com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria. Tente novamente.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: editingCategory.name,
          color: editingCategory.color,
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      setEditingCategory(null);
      fetchCategories();
      toast.success(
        `Categoria "${editingCategory.name}" atualizada com sucesso!`,
      );
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria. Tente novamente.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      fetchCategories();
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria. Tente novamente.");
    }
  };

  const handleCreateSubtask = async (todoId: string) => {
    try {
      const { error } = await supabase.from("subtasks").insert({
        title: newSubtask.title,
        description: newSubtask.description,
        status: newSubtask.status,
        todo_id: todoId,
      });

      if (error) throw error;

      setNewSubtask({
        title: "",
        description: "",
        status: "pending",
      });
      fetchTodos();
      toast.success(`Subtarefa "${newSubtask.title}" criada com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar subtarefa:", error);
      toast.error("Erro ao criar subtarefa. Tente novamente.");
    }
  };

  const handleUpdateSubtask = async (subtask: Subtask) => {
    try {
      const { error } = await supabase
        .from("subtasks")
        .update({
          title: subtask.title,
          description: subtask.description,
          status: subtask.status,
        })
        .eq("id", subtask.id);

      if (error) throw error;

      fetchTodos();
      toast.success(`Subtarefa "${subtask.title}" atualizada com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar subtarefa:", error);
      toast.error("Erro ao atualizar subtarefa. Tente novamente.");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from("subtasks")
        .delete()
        .eq("id", subtaskId);

      if (error) throw error;

      fetchTodos();
      toast.success("Subtarefa excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir subtarefa:", error);
      toast.error("Erro ao excluir subtarefa. Tente novamente.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
        <div className="flex gap-2">
          <Button color="default" onPress={() => setIsCategoryModalOpen(true)}>
            Gerenciar Categorias
          </Button>
          <Button color="primary" onPress={() => setIsModalOpen(true)}>
            Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["pending", "in_progress", "completed"] as const).map((status) => (
          <div key={status} className="space-y-4">
            <h2 className="text-lg font-semibold">{STATUS_LABELS[status]}</h2>
            <div className="space-y-4">
              {filteredTodos(status).map((todo) => (
                <Card key={todo.id} className="w-full">
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="font-medium">{todo.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditClick(todo)}
                      >
                        <svg
                          className="text-default-500"
                          fill="none"
                          height="1.5em"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="1.5em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setEditingTodo(todo);
                          handleDeleteTodo(todo.id);
                        }}
                      >
                        <svg
                          className="text-danger"
                          fill="none"
                          height="1.5em"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="1.5em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                      {status === "completed" ? (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleMoveBackTodo(todo.id, status)}
                        >
                          <svg
                            className="text-default-500"
                            fill="none"
                            height="1.5em"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="1.5em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleMoveTodo(todo.id, status)}
                        >
                          <svg
                            className="text-default-500"
                            fill="none"
                            height="1.5em"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="1.5em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody>
                    {todo.description && (
                      <p className="text-default-600 mb-4">
                        {todo.description}
                      </p>
                    )}

                    {/* Subtasks Section */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Subtarefas</h4>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => {
                            setIsSubtaskModalOpen(true);
                            setEditingSubtask(null);
                          }}
                        >
                          Adicionar Subtarefa
                        </Button>
                      </div>

                      {todo.subtasks && todo.subtasks.length > 0 ? (
                        <div className="space-y-2">
                          {todo.subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-default-100"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  checked={subtask.status === "completed"}
                                  className="rounded text-primary focus:ring-primary"
                                  type="checkbox"
                                  onChange={() => {
                                    const newStatus =
                                      subtask.status === "completed"
                                        ? "pending"
                                        : "completed";

                                    handleUpdateSubtask({
                                      ...subtask,
                                      status: newStatus,
                                    });
                                  }}
                                />
                                <span
                                  className={
                                    subtask.status === "completed"
                                      ? "line-through text-default-400"
                                      : ""
                                  }
                                >
                                  {subtask.title}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => {
                                    setEditingSubtask(subtask);
                                    setIsSubtaskModalOpen(true);
                                  }}
                                >
                                  <svg
                                    className="text-default-500"
                                    fill="none"
                                    height="1.5em"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    width="1.5em"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  </svg>
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() =>
                                    handleDeleteSubtask(subtask.id)
                                  }
                                >
                                  <svg
                                    className="text-danger"
                                    fill="none"
                                    height="1.5em"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    width="1.5em"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-default-400 text-sm">
                          Nenhuma subtarefa
                        </p>
                      )}
                    </div>

                    {/* Existing todo details */}
                    <div className="flex flex-wrap gap-2">
                      {todo.category && (
                        <div
                          className="inline-flex items-center px-2 py-1 text-sm rounded-full"
                          style={{
                            backgroundColor: todo.category.color,
                            color: "white",
                          }}
                        >
                          {todo.category.name}
                        </div>
                      )}
                      <Chip
                        className="inline-flex items-center px-2 py-1 text-sm rounded-full"
                        style={{
                          backgroundColor:
                            getPriorityColor(todo.priority) === "danger"
                              ? "#F31260"
                              : getPriorityColor(todo.priority) === "warning"
                                ? "#F5A524"
                                : "#17C964",
                          color: "white",
                        }}
                      >
                        {PRIORITY_LABELS[todo.priority]}
                      </Chip>
                      {todo.due_date && (
                        <Chip
                          className="inline-flex items-center px-2 py-1 text-sm rounded-full"
                          style={{
                            backgroundColor: "#006FEE",
                            color: "white",
                          }}
                        >
                          {new Date(todo.due_date).toLocaleDateString()}
                        </Chip>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        backdrop="opaque"
        hideCloseButton={false}
        isDismissable={true}
        isOpen={isModalOpen}
        placement="center"
        scrollBehavior="inside"
        onClose={() => setIsModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>
            <h2>Nova Tarefa</h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Título"
                placeholder="Digite o título da tarefa"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
              />

              <Input
                label="Descrição"
                placeholder="Digite a descrição"
                value={newTodo.description}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, description: e.target.value })
                }
              />

              <Select
                label="Prioridade"
                selectedKeys={new Set([newTodo.priority])}
                onSelectionChange={(keys) =>
                  setNewTodo({
                    ...newTodo,
                    priority: Array.from(keys)[0] as any,
                  })
                }
              >
                <SelectItem key="low">{PRIORITY_LABELS.low}</SelectItem>
                <SelectItem key="medium">{PRIORITY_LABELS.medium}</SelectItem>
                <SelectItem key="high">{PRIORITY_LABELS.high}</SelectItem>
              </Select>

              <Select
                label="Categoria"
                selectedKeys={
                  newTodo.category_id
                    ? new Set([newTodo.category_id])
                    : new Set()
                }
                onSelectionChange={(keys) =>
                  setNewTodo({
                    ...newTodo,
                    category_id: Array.from(keys)[0] as string,
                  })
                }
              >
                {categories.map((category) => (
                  <SelectItem key={category.id}>{category.name}</SelectItem>
                ))}
              </Select>

              <Input
                label="Data de Vencimento"
                type="date"
                value={newTodo.due_date}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, due_date: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button color="primary" onPress={handleCreateTodo}>
              Criar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        backdrop="opaque"
        disableAnimation={true}
        hideCloseButton={false}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        isOpen={isEditModalOpen}
        placement="center"
        scrollBehavior="inside"
        onClose={() => setIsEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>
            <h2>Editar Tarefa</h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Título"
                placeholder="Digite o título da tarefa"
                value={editingTodo?.title || ""}
                onChange={(e) =>
                  setEditingTodo({ ...editingTodo!, title: e.target.value })
                }
              />

              <Input
                label="Descrição"
                placeholder="Digite a descrição"
                value={editingTodo?.description || ""}
                onChange={(e) =>
                  setEditingTodo({
                    ...editingTodo!,
                    description: e.target.value,
                  })
                }
              />

              <Select
                label="Status"
                selectedKeys={new Set([editingTodo?.status || "pending"])}
                onSelectionChange={(keys) =>
                  setEditingTodo({
                    ...editingTodo!,
                    status: Array.from(keys)[0] as any,
                  })
                }
              >
                <SelectItem key="pending">Aberto</SelectItem>
                <SelectItem key="in_progress">Fazendo</SelectItem>
                <SelectItem key="completed">Feito</SelectItem>
              </Select>

              <Select
                label="Prioridade"
                selectedKeys={new Set([editingTodo?.priority || "medium"])}
                onSelectionChange={(keys) =>
                  setEditingTodo({
                    ...editingTodo!,
                    priority: Array.from(keys)[0] as any,
                  })
                }
              >
                <SelectItem key="low">{PRIORITY_LABELS.low}</SelectItem>
                <SelectItem key="medium">{PRIORITY_LABELS.medium}</SelectItem>
                <SelectItem key="high">{PRIORITY_LABELS.high}</SelectItem>
              </Select>

              <Select
                label="Categoria"
                selectedKeys={
                  editingTodo?.category?.id
                    ? new Set([editingTodo.category.id])
                    : new Set()
                }
                onSelectionChange={(keys) =>
                  setEditingTodo({
                    ...editingTodo!,
                    category:
                      categories.find((c) => c.id === Array.from(keys)[0]) ||
                      null,
                  })
                }
              >
                {categories.map((category) => (
                  <SelectItem key={category.id}>{category.name}</SelectItem>
                ))}
              </Select>

              <Input
                label="Data de Vencimento"
                type="date"
                value={formatDateForInput(editingTodo?.due_date || null)}
                onChange={(e) =>
                  setEditingTodo({ ...editingTodo!, due_date: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-between w-full">
              <Button
                color="danger"
                variant="light"
                onPress={() => editingTodo && handleDeleteTodo(editingTodo.id)}
              >
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button
                  color="default"
                  variant="light"
                  onPress={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleUpdateTodo}>
                  Salvar
                </Button>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        backdrop="opaque"
        hideCloseButton={false}
        isDismissable={true}
        isOpen={isCategoryModalOpen}
        placement="center"
        scrollBehavior="inside"
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2>Gerenciar Categorias</h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Nome da Categoria"
                    placeholder="Digite o nome da categoria"
                    value={editingCategory?.name || newCategory.name}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        : setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                    }
                  />
                  <div className="space-y-2">
                    <label
                      className="text-sm text-default-500"
                      htmlFor="category-color"
                    >
                      Cor
                    </label>
                    <div className="flex gap-4 items-center">
                      <input
                        className="w-12 h-12 rounded cursor-pointer"
                        id="category-color"
                        type="color"
                        value={editingCategory?.color || newCategory.color}
                        onChange={(e) =>
                          editingCategory
                            ? setEditingCategory({
                                ...editingCategory,
                                color: e.target.value,
                              })
                            : setNewCategory({
                                ...newCategory,
                                color: e.target.value,
                              })
                        }
                      />
                      <div
                        className="w-12 h-12 rounded border border-default-200"
                        style={{
                          backgroundColor:
                            editingCategory?.color || newCategory.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categorias Existentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg group hover:bg-default-100 transition-colors"
                      style={{ backgroundColor: category.color }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => setEditingCategory(category)}
                        >
                          <svg
                            className="text-default-500"
                            fill="none"
                            height="1.5em"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="1.5em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleDeleteCategory(category.id)}
                        >
                          <svg
                            className="text-danger"
                            fill="none"
                            height="1.5em"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="1.5em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {editingCategory ? (
              <div className="flex justify-end gap-2">
                <Button
                  color="default"
                  variant="light"
                  onPress={() => setEditingCategory(null)}
                >
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleUpdateCategory}>
                  Salvar
                </Button>
              </div>
            ) : (
              <Button color="primary" onPress={handleCreateCategory}>
                Adicionar Categoria
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Subtask Modal */}
      <Modal
        isOpen={isSubtaskModalOpen}
        onClose={() => {
          setIsSubtaskModalOpen(false);
          setEditingSubtask(null);
          setNewSubtask({
            title: "",
            description: "",
            status: "pending",
          });
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editingSubtask ? "Editar Subtarefa" : "Nova Subtarefa"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Título"
                value={editingSubtask ? editingSubtask.title : newSubtask.title}
                onChange={(e) => {
                  if (editingSubtask) {
                    setEditingSubtask({
                      ...editingSubtask,
                      title: e.target.value,
                    });
                  } else {
                    setNewSubtask({ ...newSubtask, title: e.target.value });
                  }
                }}
              />
              <Input
                label="Descrição"
                value={
                  editingSubtask
                    ? editingSubtask.description || ""
                    : newSubtask.description
                }
                onChange={(e) => {
                  if (editingSubtask) {
                    setEditingSubtask({
                      ...editingSubtask,
                      description: e.target.value,
                    });
                  } else {
                    setNewSubtask({
                      ...newSubtask,
                      description: e.target.value,
                    });
                  }
                }}
              />
              <Select
                label="Status"
                selectedKeys={[
                  editingSubtask ? editingSubtask.status : newSubtask.status,
                ]}
                onChange={(e) => {
                  const value = e.target.value as
                    | "pending"
                    | "in_progress"
                    | "completed";

                  if (editingSubtask) {
                    setEditingSubtask({ ...editingSubtask, status: value });
                  } else {
                    setNewSubtask({ ...newSubtask, status: value });
                  }
                }}
              >
                <SelectItem key="pending">Aberto</SelectItem>
                <SelectItem key="in_progress">Fazendo</SelectItem>
                <SelectItem key="completed">Feito</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setIsSubtaskModalOpen(false);
                setEditingSubtask(null);
                setNewSubtask({
                  title: "",
                  description: "",
                  status: "pending",
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={() => {
                if (editingSubtask) {
                  handleUpdateSubtask(editingSubtask);
                } else {
                  const todoId = editingTodo?.id;

                  if (todoId) {
                    handleCreateSubtask(todoId);
                  }
                }
                setIsSubtaskModalOpen(false);
                setEditingSubtask(null);
                setNewSubtask({
                  title: "",
                  description: "",
                  status: "pending",
                });
              }}
            >
              {editingSubtask ? "Atualizar" : "Criar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
