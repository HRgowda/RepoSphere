import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import useProject from '@/hooks/use-project'
import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from "next/image"
import { askQuestion } from './action'
import { readStreamableValue } from 'ai/rsc'
import MDEditor from "@uiw/react-md-editor"
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFileReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);
  const [answer, setAnswer] = useState('');
  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer('');
    setFileReferences([]);
    if (!project?.id) return;
    setLoading(true);

    setOpen(true);
    const { output, filesReferences } = await askQuestion(question, project.id);
    setFileReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer(ans => ans + delta);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src='/logo.png' alt='RepoSphere' width={40} height={40} />
              </DialogTitle>

              <Button
                disabled={saveAnswer.isPending}
                variant={'outline'}
                onClick={() => {
                  saveAnswer.mutate({
                    projectId: project!.id,
                    question,
                    answer,
                    filesReferences
                  }, {
                    onSuccess: () => {
                      toast.success("Answer saved!");
                    },
                    onError: () => {
                      toast.error("Failed to save answer!");
                    }
                  });
                }}
              >
                Save answer
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-auto max-h-[60vh]">
            <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll' />
            <div className="h-4"></div>
            <CodeReferences fileReferences={filesReferences} />
          </div>

          <div className="mt-4 flex justify-between">
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask RepoSphere!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
