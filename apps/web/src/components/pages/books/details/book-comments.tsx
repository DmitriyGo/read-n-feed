import { CommentResponseDto, CreateCommentDto } from '@read-n-feed/application';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Form,
  FormControl,
  FormField,
  FormItem,
  Textarea,
} from '@/components/ui';
import { useGetProfile, useCommentsForBook } from '@/hooks/read';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/write';
import { formatDate } from '@/lib/utils';

interface CommentFormData {
  content: string;
}

export const BookComments = ({ bookId }: { bookId?: string }) => {
  const { t } = useTranslation();
  const { data: commentsResponse, isLoading } = useCommentsForBook(bookId);
  const { data: profileData } = useGetProfile();
  const { mutate: createComment } = useCreateComment();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const form = useForm<CommentFormData>({
    defaultValues: {
      content: '',
    },
  });

  const handleSubmit = (data: CommentFormData) => {
    if (!bookId || !profileData?.data?.id) return;

    const commentData: CreateCommentDto = {
      bookId,
      userId: profileData.data.id,
      content: data.content,
    };

    createComment(commentData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  if (!bookId) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">{t('comments')}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p>{t('loadingComments')}</p>
        ) : (
          <div className="space-y-4">
            {commentsResponse?.data?.length === 0 ? (
              <p>{t('noCommentsYet')}</p>
            ) : (
              <div className="space-y-4">
                {commentsResponse?.data?.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    bookId={bookId}
                    currentUserId={profileData?.data?.id}
                    isEditing={editingCommentId === comment.id}
                    onStartEditing={() => setEditingCommentId(comment.id)}
                    onCancelEditing={() => setEditingCommentId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {profileData?.data ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t('addComment')}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">{t('postComment')}</Button>
            </form>
          </Form>
        ) : (
          <div className="p-4 border border-dashed rounded-md text-center">
            <p className="text-muted-foreground">{t('signInToComment')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CommentItemProps {
  comment: CommentResponseDto;
  bookId: string;
  currentUserId?: string;
  isEditing: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
}

const CommentItem = ({
  comment,
  bookId,
  currentUserId,
  isEditing,
  onStartEditing,
  onCancelEditing,
}: CommentItemProps) => {
  const { t } = useTranslation();
  const { mutate: deleteComment } = useDeleteComment(comment.id, bookId);
  const { mutate: updateComment } = useUpdateComment(comment.id, bookId);

  const form = useForm<CommentFormData>({
    defaultValues: {
      content: comment.content,
    },
  });

  const handleUpdate = (data: CommentFormData) => {
    updateComment(
      { content: data.content },
      {
        onSuccess: () => {
          onCancelEditing();
        },
      },
    );
  };

  const isOwner = currentUserId === comment.userId;

  return (
    <div className="p-4 border rounded-md">
      {isEditing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex space-x-2">
              <Button type="submit">{t('save')}</Button>
              <Button variant="outline" onClick={onCancelEditing}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">
                {comment.username || t('anonymous')} •{' '}
                {formatDate(comment.createdAt)}
                {comment.createdAt !== comment.updatedAt && t('edited')}
              </p>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={onStartEditing}>
                  {t('edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteComment()}
                  className="text-destructive hover:text-destructive"
                >
                  {t('delete')}
                </Button>
              </div>
            )}
          </div>
          <p className="mt-2">{comment.content}</p>
        </>
      )}
    </div>
  );
};
