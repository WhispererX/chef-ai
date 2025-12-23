import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { OPENAI_API_KEY } from '@env';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { recipeStorage } from '../utils/recipeStorage';
import { pantryStorage } from '../utils/pantryStorage';
import AddIngredientModal from './AddIngredientModal';

const SYSTEM_PROMPT =
  'You are Chef AI, a professional personal chef assistant. When users ask about recipe ingredients, directions, or details from an attached recipe, extract and explain them clearly. Give concise, friendly cooking guidance, suggest recipes, adjust to dietary needs, and keep responses actionable. Use tools when helpful to fetch data. Don\'t use markdown to format your responses.';

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_recipes',
      description: 'List all saved recipes',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_recipe',
      description: 'Search recipes by name or description',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_recipe',
      description: 'Create a new recipe with name, description, category, ingredients, and steps',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Recipe name' },
          description: { type: 'string', description: 'Recipe description' },
          category: { type: 'string', description: 'Recipe category' },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'string' },
                unit: { type: 'string' },
              },
              required: ['name', 'quantity', 'unit'],
            },
          },
          steps: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'ingredients', 'steps'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'edit_recipe',
      description: 'Edit an existing recipe by its ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Recipe ID' },
          name: { type: 'string', description: 'Updated recipe name' },
          description: { type: 'string', description: 'Updated description' },
          category: { type: 'string', description: 'Updated category' },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'string' },
                unit: { type: 'string' },
              },
            },
          },
          steps: { type: 'array', items: { type: 'string' } },
        },
        required: ['id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pantry_ingredients',
      description: 'List pantry ingredients',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_pantry_ingredient',
      description: 'Add a new ingredient to the pantry',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Ingredient name' },
          quantity: { type: 'string', description: 'Quantity amount' },
          unit: { type: 'string', description: 'Unit of measurement (g, kg, ml, l, cups, tbsp, tsp, pieces, etc.)' },
          category: { type: 'string', description: 'Category like Vegetables, Fruits, Dairy, Meat, etc.' },
        },
        required: ['name', 'quantity', 'unit'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'edit_pantry_ingredient',
      description: 'Edit an existing pantry ingredient by its ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Ingredient ID' },
          name: { type: 'string', description: 'Updated name' },
          quantity: { type: 'string', description: 'Updated quantity' },
          unit: { type: 'string', description: 'Updated unit' },
          category: { type: 'string', description: 'Updated category' },
        },
        required: ['id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_pantry_ingredient',
      description: 'Remove an ingredient from the pantry by its ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Ingredient ID to remove' },
        },
        required: ['id'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recipes_from_pantry',
      description: 'Find recipes that can be made with current pantry items',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
];

const MessageBubble = ({ message, onRecipePress, onIngredientPress }) => {
  const isAssistant = message.role === 'assistant';
  return (
    <View style={[styles.bubbleRow, isAssistant ? styles.leftAlign : styles.rightAlign]}>
      {isAssistant ? (
        <Image source={require('../assets/chef.png')} style={styles.avatar} />
      ) : (
        <View style={styles.userSpacer} />
      )}
      <View style={[styles.bubble, isAssistant ? styles.assistantBubble : styles.userBubble]}>
        {isAssistant ? <Text style={styles.assistantName}>Chef AI</Text> : null}
        <Text style={styles.messageText}>{message.text}</Text>
        {message.recipes && message.recipes.length > 0 ? (
          <View style={styles.recipesContainer}>
            {message.recipes.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => onRecipePress?.(recipe)}
                activeOpacity={0.8}
              >
                {recipe.image ? (
                  <Image source={{ uri: recipe.image }} style={styles.recipeCardImage} />
                ) : (
                  <View style={styles.recipeCardImagePlaceholder}>
                    <FontAwesome5 name="utensils" size={24} color={colors.muted} />
                  </View>
                )}
                <View style={styles.recipeCardContent}>
                  <Text style={styles.recipeCardTitle} numberOfLines={2}>
                    {recipe.name}
                  </Text>
                  <Text style={styles.recipeCardMeta}>{recipe.category || 'Recipe'}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        {message.ingredients && message.ingredients.length > 0 ? (
          <View style={styles.recipesContainer}>
            {message.ingredients.map(ingredient => (
              <TouchableOpacity
                key={ingredient.id}
                style={styles.recipeCard}
                onPress={() => onIngredientPress?.(ingredient)}
                activeOpacity={0.8}
              >
                <View style={styles.recipeCardImagePlaceholder}>
                  <FontAwesome5 name="carrot" size={24} color={colors.muted} />
                </View>
                <View style={styles.recipeCardContent}>
                  <Text style={styles.recipeCardTitle} numberOfLines={1}>
                    {ingredient.name}
                  </Text>
                  <Text style={styles.recipeCardMeta}>
                    {ingredient.quantity} {ingredient.unit}
                  </Text>
                </View>
                <FontAwesome5 name="edit" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        {message.recipe ? (
          <View style={styles.recipeChip}>
            <Text style={styles.recipeChipTitle}>{message.recipe.name}</Text>
            <Text style={styles.recipeChipMeta}>{message.recipe.category || 'Recipe'}</Text>
          </View>
        ) : null}
        {message.image ? <Image source={{ uri: message.image.uri }} style={styles.inlineImage} /> : null}
      </View>
      {!isAssistant ? <View style={styles.userSpacer} /> : null}
    </View>
  );
};

const RecipePickerModal = ({ visible, onClose, recipes, onSelect }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Attach recipe</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalClose} activeOpacity={0.8}>
            <FontAwesome5 name="times" size={18} color={colors.heading} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 360 }}>
          {recipes.map(recipe => (
            <Pressable
              key={recipe.id}
              onPress={() => {
                onSelect(recipe);
                onClose();
              }}
              style={styles.recipeRow}
            >
              <View>
                <Text style={styles.recipeRowTitle}>{recipe.name}</Text>
                <Text style={styles.recipeRowMeta}>{recipe.category || 'Uncategorized'}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color={colors.muted} />
            </Pressable>
          ))}
          {recipes.length === 0 ? (
            <Text style={styles.emptyRecipes}>No recipes saved</Text>
          ) : null}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default function AssistantScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi, I am Chef AI. Tell me what you feel like cooking or share your pantry and I will help.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedRecipe, setAttachedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const flatListRef = useRef(null);

  useFocusEffect(
    useMemo(
      () => () => {
        loadRecipes();
      },
      []
    )
  );

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const stored = await recipeStorage.getAllRecipes();
    setRecipes(stored);
  };

  const handleIngredientUpdate = async payload => {
    if (!editingIngredient) return;
    await pantryStorage.updateIngredient(editingIngredient.id, payload);
    setEditingIngredient(null);
    setShowIngredientModal(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachedImage({ uri: asset.uri, base64: asset.base64, mime: asset.mimeType || 'image/jpeg' });
    }
  };

  const buildUserContent = () => {
    const content = [];
    if (input.trim().length > 0) {
      content.push({ type: 'text', text: input.trim() });
    }
    if (attachedRecipe) {
      const recipeText = JSON.stringify({
        name: attachedRecipe.name,
        description: attachedRecipe.description,
        ingredients: attachedRecipe.ingredients,
        steps: attachedRecipe.steps,
        category: attachedRecipe.category,
      });
      content.push({ type: 'text', text: `Attached recipe: ${recipeText}` });
    }
    if (attachedImage && attachedImage.base64) {
      content.push({
        type: 'image_url',
        image_url: { url: `data:${attachedImage.mime};base64,${attachedImage.base64}` },
      });
    }
    return content;
  };

  const appendMessage = msg => {
    setMessages(prev => [...prev, msg]);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleSend = async () => {
    if (sending) return;
    const content = buildUserContent();
    if (content.length === 0) return;
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      image: attachedImage,
      recipe: attachedRecipe,
    };
    appendMessage(userMessage);
    setInput('');
    setAttachedImage(null);
    setAttachedRecipe(null);
    setSending(true);

    try {
      const { text, recipes, ingredients } = await callOpenAI([...messages, userMessage], content);
      if (text) {
        appendMessage({ id: `${Date.now()}-ai`, role: 'assistant', text, recipes: recipes || [], ingredients: ingredients || [] });
      }
    } catch (error) {
      appendMessage({ id: `${Date.now()}-error`, role: 'assistant', text: 'Sorry, something went wrong. Try again.' });
    } finally {
      setSending(false);
    }
  };

  const callOpenAI = async (chatMessages, userContent) => {
    const apiKey = OPENAI_API_KEY || '';
    if (!apiKey) throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env file');
    const formatted = chatMessages.map(m => {
      if (m.role === 'assistant') {
        return { role: 'assistant', content: [{ type: 'text', text: m.text }] };
      }
      const content = [];
      if (m.text) content.push({ type: 'text', text: m.text });
      if (m.recipe) content.push({ type: 'text', text: `Attached recipe: ${JSON.stringify(m.recipe)}` });
      if (m.image && m.image.base64) {
        content.push({ type: 'image_url', image_url: { url: `data:${m.image.mime};base64,${m.image.base64}` } });
      }
      return { role: 'user', content };
    });

    const body = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] }, ...formatted.slice(-10), { role: 'user', content: userContent }],
      tools: TOOLS,
      temperature: 0.6,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'OpenAI error');
    const choice = data.choices?.[0]?.message;
    let extractedRecipes = [];
    let extractedIngredients = [];
    if (choice?.tool_calls && choice.tool_calls.length > 0) {
      const toolResults = await handleToolCalls(choice.tool_calls);
      extractedRecipes = extractRecipesFromToolResults(toolResults);
      extractedIngredients = extractIngredientsFromToolResults(toolResults);
      const followUpBody = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] },
          ...formatted.slice(-10),
          { role: 'user', content: userContent },
          choice,
          ...toolResults,
        ],
        temperature: 0.6,
      };
      const follow = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(followUpBody),
      });
      const followJson = await follow.json();
      if (followJson.error) throw new Error(followJson.error.message || 'OpenAI error');
      const followContent = followJson.choices?.[0]?.message?.content;
      const text = typeof followContent === 'string' ? followContent : followContent?.[0]?.text || 'Here are the results.';
      return { text, recipes: extractedRecipes, ingredients: extractedIngredients };
    }
    const directContent = choice?.content;
    const text = typeof directContent === 'string' ? directContent : directContent?.[0]?.text || 'Here is what I found.';
    return { text, recipes: [], ingredients: [] };
  };

  const extractRecipesFromToolResults = toolResults => {
    const recipes = [];
    toolResults.forEach(result => {
      try {
        const content = result.content?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(item => item && (item.ingredients || item.steps));
            recipes.push(...filtered);
          } else if (parsed && typeof parsed === 'object' && (parsed.ingredients || parsed.steps)) {
            recipes.push(parsed);
          }
        }
      } catch {}
    });
    return recipes.slice(0, 5);
  };

  const extractIngredientsFromToolResults = toolResults => {
    const ingredients = [];
    toolResults.forEach(result => {
      try {
        const content = result.content?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].quantity) {
            ingredients.push(...parsed);
          }
        }
      } catch {}
    });
    return ingredients.slice(0, 8);
  };

  const handleToolCalls = async toolCalls => {
    const results = [];
    for (const call of toolCalls) {
      const name = call.function?.name;
      const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
      let result = null;
      if (name === 'get_recipes') {
        result = await recipeStorage.getAllRecipes();
      } else if (name === 'search_recipe') {
        result = await recipeStorage.searchRecipes(args.query || '');
      } else if (name === 'create_recipe') {
        const newRecipe = {
          id: Date.now().toString(),
          name: args.name,
          description: args.description || '',
          category: args.category || 'Uncategorized',
          ingredients: args.ingredients || [],
          steps: args.steps || [],
          image: null,
        };
        await recipeStorage.addRecipe(newRecipe);
        result = { success: true, recipe: newRecipe };
      } else if (name === 'edit_recipe') {
        const existing = await recipeStorage.getRecipeById(args.id);
        if (existing) {
          const updated = {
            ...existing,
            ...(args.name && { name: args.name }),
            ...(args.description && { description: args.description }),
            ...(args.category && { category: args.category }),
            ...(args.ingredients && { ingredients: args.ingredients }),
            ...(args.steps && { steps: args.steps }),
          };
          await recipeStorage.updateRecipe(updated);
          result = { success: true, recipe: updated };
        } else {
          result = { error: 'Recipe not found' };
        }
      } else if (name === 'get_pantry_ingredients') {
        result = await pantryStorage.getAllIngredients();
      } else if (name === 'add_pantry_ingredient') {
        const newIngredient = {
          id: Date.now().toString(),
          name: args.name,
          quantity: args.quantity,
          unit: args.unit,
          category: args.category || 'Other',
        };
        await pantryStorage.addIngredient(newIngredient);
        result = { success: true, ingredient: newIngredient };
      } else if (name === 'edit_pantry_ingredient') {
        const existing = await pantryStorage.getAllIngredients();
        const found = existing.find(i => i.id === args.id);
        if (found) {
          const updated = {
            ...found,
            ...(args.name && { name: args.name }),
            ...(args.quantity && { quantity: args.quantity }),
            ...(args.unit && { unit: args.unit }),
            ...(args.category && { category: args.category }),
          };
          await pantryStorage.updateIngredient(updated);
          result = { success: true, ingredient: updated };
        } else {
          result = { error: 'Ingredient not found' };
        }
      } else if (name === 'remove_pantry_ingredient') {
        await pantryStorage.deleteIngredient(args.id);
        result = { success: true };
      } else if (name === 'recipes_from_pantry') {
        const pantry = await pantryStorage.getAllIngredients();
        const all = await recipeStorage.getAllRecipes();
        result = all.filter(recipe =>
          recipe.ingredients.every(ing =>
            pantry.some(item => item.name?.toLowerCase() === ing.name?.toLowerCase())
          )
        );
      } else {
        result = { error: 'Unsupported tool' };
      }
      results.push({ role: 'tool', tool_call_id: call.id, content: [{ type: 'text', text: JSON.stringify(result) }] });
    }
    return results;
  };

  const renderItem = ({ item }) => (
    <MessageBubble
      message={item}
      onRecipePress={recipe => navigation.navigate('Cookbook', { screen: 'RecipeDetails', params: { recipeId: recipe.id } })}
      onIngredientPress={ingredient => {
        setEditingIngredient(ingredient);
        setShowIngredientModal(true);
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chef AI</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        scrollEnabled={true}
      />

      {attachedRecipe ? (
        <View style={styles.attachmentBar}>
          <Text style={styles.attachmentText}>Attached recipe: {attachedRecipe.name}</Text>
          <TouchableOpacity onPress={() => setAttachedRecipe(null)} activeOpacity={0.7}>
            <FontAwesome5 name="times" size={16} color={colors.heading} />
          </TouchableOpacity>
        </View>
      ) : null}
      {attachedImage ? (
        <View style={styles.attachmentBar}>
          <Text style={styles.attachmentText}>Attached image</Text>
          <TouchableOpacity onPress={() => setAttachedImage(null)} activeOpacity={0.7}>
            <FontAwesome5 name="times" size={16} color={colors.heading} />
          </TouchableOpacity>
        </View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <View style={styles.inputBar}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolButton} onPress={pickImage} activeOpacity={0.8}>
              <FontAwesome5 name="paperclip" size={20} color={colors.heading} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={() => setShowRecipeModal(true)} activeOpacity={0.8}>
              <FontAwesome5 name="book" size={20} color={colors.heading} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending} activeOpacity={0.9}>
            {sending ? <ActivityIndicator color={colors.heading} /> : <FontAwesome5 name="paper-plane" size={18} color={colors.heading} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <RecipePickerModal
        visible={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        recipes={recipes}
        onSelect={setAttachedRecipe}
      />

      <AddIngredientModal
        visible={showIngredientModal}
        onClose={() => {
          setShowIngredientModal(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleIngredientUpdate}
        initialIngredient={editingIngredient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  leftAlign: { justifyContent: 'flex-start' },
  rightAlign: { justifyContent: 'flex-end' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    transform: [{ scale: 1.1 }],
  },
  userSpacer: { width: 36 },
  bubble: {
    maxWidth: '85%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  assistantBubble: {
    backgroundColor: colors.foreground,
    borderTopLeftRadius: 8,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 8,
  },
  assistantName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: fontSize.md,
    color: colors.heading,
    lineHeight: 22,
  },
  recipesContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipeCardImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  recipeCardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeCardContent: {
    flex: 1,
  },
  recipeCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
  recipeCardMeta: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  recipeChipTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
  recipeChipMeta: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  inlineImage: {
    marginTop: spacing.sm,
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
  },
  keyboardAvoid: {
    backgroundColor: colors.foreground,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.foreground,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    color: colors.heading,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachmentText: {
    color: colors.heading,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recipeRowTitle: {
    fontSize: fontSize.md,
    color: colors.heading,
    fontWeight: fontWeight.semibold,
  },
  recipeRowMeta: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  emptyRecipes: {
    color: colors.muted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
