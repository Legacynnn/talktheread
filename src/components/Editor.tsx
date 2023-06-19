"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { PostCreate, PostValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "../lib/uploadthing";
import { toast } from "../hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  roomId: string;
}

export default function Editor({ roomId }: Props) {
  const pahtName = usePathname();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreate>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      roomId,
      title: "",
      content: null,
    },
  });

  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<Boolean>(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // upload to uploadthing
                  const [res] = await uploadFiles([file], "imageUploader");

                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: "Erghh, something goes wrong",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef.current?.focus();
      });
    };

    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost } = useMutation({
    mutationFn: async ({ title, content, roomId }: PostCreate) => {
      const payload: PostCreate = {
        roomId,
        title,
        content,
      };

      const { data } = await axios.post("/api/room/post/create", payload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Erghh, something goes wrong",
        description: "Please try to create your post again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPathName = pahtName.split("/").slice(0, -1).join("/");
      router.push(newPathName);

      router.refresh();

      return toast({
        title: "🥳 Your post has been created",
        description: "Now, everyone on your room can see it",
      });
    },
  });

  async function onSubmit(data: PostCreate) {
    const blocks = await ref.current?.save();

    const payload: PostCreate = {
      title: data.title,
      content: blocks,
      roomId,
    };

    createPost(payload);
  }

  if (!isMounted) return null;

  const { ref: titleRef, ...rest } = register("title");

  return (
    <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <form
        id="room-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-stone">
          <TextareaAutoSize
            ref={(e) => {
              titleRef(e);

              // @ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />

          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
}
