import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Filter, ListChecks, Megaphone, MessageSquareText, Plus, RefreshCw, Search, Send, Users, X } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { broadcastSmsApiService } from '../../../services/api/broadcast-sms-api-service';
import type {
  CampaignDeliveryChannel,
  CampaignTargetMode,
  FilteredBroadcastSmsRequest,
  MessageTemplate,
  MessageTemplateParameter,
  SmsCampaign,
} from '../../../services/api/broadcast-sms-api-service';
import { OwnersApiService } from '../../users/services/owner.service';
import type { Owner, OwnersQueryParams } from '../../users/types/owner';

type BroadcastTargetMode = 'ALL_USERS' | 'SELECTED_USERS';
type CampaignView = 'BROADCAST_SMS' | 'CAMPAIGN_LIST' | 'MESSAGE_TEMPLATES';

type CampaignFormState = {
  campaignName: string;
  messageTemplateId: string;
  targetMode: CampaignTargetMode;
  deliveryChannel: CampaignDeliveryChannel;
  sources: string[];
  registeredFromDate: string;
  registeredToDate: string;
  minProductCount: string;
  maxProductCount: string;
  minSaleCount: string;
  maxSaleCount: string;
  minPurchaseCount: string;
  maxPurchaseCount: string;
  minStoreCount: string;
  maxStoreCount: string;
  minStaffCount: string;
  maxStaffCount: string;
  expiredPlanOnly: boolean;
  activePlanOnly: boolean;
};

const sourceOptions = ['MOBILE', 'WEB', 'DEMO'];

const defaultCampaignForm: CampaignFormState = {
  campaignName: '',
  messageTemplateId: '',
  targetMode: 'ALL_USERS',
  deliveryChannel: 'SMS',
  sources: [],
  registeredFromDate: '',
  registeredToDate: '',
  minProductCount: '',
  maxProductCount: '',
  minSaleCount: '',
  maxSaleCount: '',
  minPurchaseCount: '',
  maxPurchaseCount: '',
  minStoreCount: '',
  maxStoreCount: '',
  minStaffCount: '',
  maxStaffCount: '',
  expiredPlanOnly: false,
  activePlanOnly: false,
};

type RerunCampaignFormState = {
  campaignName: string;
  messageTemplateId: string;
  deliveryChannel: CampaignDeliveryChannel;
};

type TemplateFormState = {
  templateName: string;
  languageCode: string;
  category: string;
  bodyText: string;
  headerText: string;
  footerText: string;
  defaultBodyParametersJson: string;
};

type TemplateVariable = {
  key: string;
  kind: 'named' | 'positional';
};

const defaultTemplateForm: TemplateFormState = {
  templateName: '',
  languageCode: 'en_US',
  category: 'UTILITY',
  bodyText: '',
  headerText: '',
  footerText: '',
  defaultBodyParametersJson: '[]',
};

const variablePattern = /\{\{\s*([^{}]+?)\s*}}/g;
const positionalVariablePattern = /^[1-9][0-9]*$/;

function extractTemplateVariables(bodyText: string): TemplateVariable[] {
  const variables: TemplateVariable[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  variablePattern.lastIndex = 0;
  while ((match = variablePattern.exec(bodyText)) !== null) {
    const key = match[1].trim();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    variables.push({
      key,
      kind: positionalVariablePattern.test(key) ? 'positional' : 'named',
    });
  }

  return variables.sort((left, right) => {
    if (left.kind === 'positional' && right.kind === 'positional') {
      return Number(left.key) - Number(right.key);
    }
    return left.key.localeCompare(right.key);
  });
}

function readTemplateParameterValues(parametersJson: string): Record<string, string> {
  try {
    const parsed = JSON.parse(parametersJson || '[]');
    if (!Array.isArray(parsed)) {
      return {};
    }

    return parsed.reduce<Record<string, string>>((values, parameter, index) => {
      if (!parameter || typeof parameter !== 'object') {
        return values;
      }

      const key = typeof parameter.parameter_name === 'string' && parameter.parameter_name.trim()
        ? parameter.parameter_name.trim()
        : typeof parameter.parameterName === 'string' && parameter.parameterName.trim()
          ? parameter.parameterName.trim()
          : String(index + 1);
      values[key] = typeof parameter.text === 'string' ? parameter.text : '';
      return values;
    }, {});
  } catch {
    return {};
  }
}

function validateTemplateVariableRules(bodyText: string, variables: TemplateVariable[], values: Record<string, string>) {
  const openCount = (bodyText.match(/\{\{/g) || []).length;
  const closeCount = (bodyText.match(/}}/g) || []).length;
  const placeholderCount = (bodyText.match(/\{\{\s*([^{}]+?)\s*}}/g) || []).length;
  if (openCount !== placeholderCount || closeCount !== placeholderCount) {
    return 'Variables must use valid numbered format like {{1}}, {{2}}';
  }

  const hasNamed = variables.some((variable) => variable.kind === 'named');
  if (hasNamed) {
    return 'Meta requires template variables to be whole numbers only. Use {{1}}, {{2}}, {{3}} instead of names like {{name}}.';
  }

  const numbers = variables.map((variable) => Number(variable.key)).sort((left, right) => left - right);
  for (let index = 0; index < numbers.length; index += 1) {
    if (numbers[index] !== index + 1) {
      return 'Numbered variables must be sequential starting from {{1}}';
    }
  }

  const missingExample = variables.find((variable) => !values[variable.key]?.trim());
  if (missingExample) {
    return `Add an example value for {{${missingExample.key}}}`;
  }

  return null;
}

type BroadcastSmsPageProps = {
  initialView?: CampaignView;
};

export const BroadcastSmsPage: React.FC<BroadcastSmsPageProps> = ({ initialView = 'BROADCAST_SMS' }) => {
  const ownersService = new OwnersApiService();
  const [activeView, setActiveView] = useState<CampaignView>(initialView);
  const [broadcastCampaignName, setBroadcastCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [targetMode, setTargetMode] = useState<BroadcastTargetMode>('ALL_USERS');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [ownersLoaded, setOwnersLoaded] = useState(false);
  const ownersLoadStartedRef = React.useRef(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(defaultTemplateForm);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showCampaignDetailsModal, setShowCampaignDetailsModal] = useState(false);
  const [showRerunCampaignModal, setShowRerunCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SmsCampaign | null>(null);
  const [rerunCampaign, setRerunCampaign] = useState<SmsCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<CampaignFormState>(defaultCampaignForm);
  const [rerunForm, setRerunForm] = useState<RerunCampaignFormState>({
    campaignName: '',
    messageTemplateId: '',
    deliveryChannel: 'SMS',
  });
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [campaignOwnerSearch, setCampaignOwnerSearch] = useState('');
  const [campaignSelectedPhoneNumbers, setCampaignSelectedPhoneNumbers] = useState<string[]>([]);
  const [campaignFilteredOwners, setCampaignFilteredOwners] = useState<Owner[]>([]);
  const [campaignFiltersApplied, setCampaignFiltersApplied] = useState(false);
  const [campaignFiltersLoading, setCampaignFiltersLoading] = useState(false);
  const [rerunningCampaignId, setRerunningCampaignId] = useState<string | null>(null);

  const trimmedMessage = message.trim();
  const smsSegments = trimmedMessage ? Math.max(1, Math.ceil(trimmedMessage.length / 160)) : 0;
  const selectedOwners = useMemo(
    () => owners.filter((owner) => selectedPhoneNumbers.includes(owner.phoneNumber)),
    [owners, selectedPhoneNumbers]
  );
  const filteredOwners = useMemo(() => {
    const query = ownerSearch.trim().toLowerCase();

    if (!query) {
      return owners;
    }

    return owners.filter((owner) =>
      [owner.fullName, owner.phoneNumber, owner.email].join(' ').toLowerCase().includes(query)
    );
  }, [ownerSearch, owners]);
  const filteredCampaignOwners = useMemo(() => {
    const query = campaignOwnerSearch.trim().toLowerCase();
    const baseOwners = campaignForm.targetMode === 'FILTERED_USERS' ? campaignFilteredOwners : owners;

    if (!query) {
      return baseOwners;
    }

    return baseOwners.filter((owner) =>
      [owner.fullName, owner.phoneNumber, owner.email, owner.source].join(' ').toLowerCase().includes(query)
    );
  }, [campaignFilteredOwners, campaignForm.targetMode, campaignOwnerSearch, owners]);
  const selectedCampaignTemplate = useMemo(
    () => messageTemplates.find((template) => template.id === campaignForm.messageTemplateId),
    [campaignForm.messageTemplateId, messageTemplates]
  );
  const selectedRerunTemplate = useMemo(
    () => messageTemplates.find((template) => template.id === rerunForm.messageTemplateId),
    [messageTemplates, rerunForm.messageTemplateId]
  );
  const templateVariables = useMemo(
    () => extractTemplateVariables(templateForm.bodyText),
    [templateForm.bodyText]
  );
  const templateParameterValues = useMemo(
    () => readTemplateParameterValues(templateForm.defaultBodyParametersJson),
    [templateForm.defaultBodyParametersJson]
  );

  useEffect(() => {
    if (activeView === 'CAMPAIGN_LIST') {
      void loadCampaigns();
    }
    if (activeView === 'MESSAGE_TEMPLATES') {
      void loadMessageTemplates();
    }
  }, [activeView]);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const loadCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const data = await broadcastSmsApiService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load SMS campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setCampaignsLoading(false);
    }
  };

  const loadMessageTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const data = await broadcastSmsApiService.getMessageTemplates();
      setMessageTemplates(data);
    } catch (error) {
      console.error('Failed to load message templates:', error);
      toast.error('Failed to load message templates');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const loadOwners = async () => {
    if (ownersLoaded || ownersLoadStartedRef.current) {
      return;
    }

    try {
      ownersLoadStartedRef.current = true;
      setOwnersLoading(true);

      const collectedOwners: Owner[] = [];
      let page = 0;
      let totalPages = 1;

      while (page < totalPages) {
        const response = await ownersService.getOwners({
          page,
          size: 100,
          sortBy: 'fullName',
          sortDir: 'asc',
        });

        const payload = response.data;
        const pageOwners = payload?.content || [];
        const validOwners = pageOwners.filter((owner) => owner.phoneNumber?.trim());

        collectedOwners.push(...validOwners);
        totalPages = payload?.totalPages || 0;
        page += 1;
      }

      const uniqueOwners = Array.from(
        new Map(collectedOwners.map((owner) => [owner.phoneNumber, owner])).values()
      );

      setOwners(uniqueOwners);
      setOwnersLoaded(true);
    } catch (error) {
      ownersLoadStartedRef.current = false;
      console.error('Failed to load owners for broadcast selection:', error);
      toast.error('Failed to load users for SMS selection');
    } finally {
      setOwnersLoading(false);
    }
  };

  const toggleOwnerSelection = (phoneNumber: string) => {
    setSelectedPhoneNumbers((current) =>
      current.includes(phoneNumber)
        ? current.filter((item) => item !== phoneNumber)
        : [...current, phoneNumber]
    );
  };

  const removeSelectedPhoneNumber = (phoneNumber: string) => {
    setSelectedPhoneNumbers((current) => current.filter((item) => item !== phoneNumber));
  };

  const selectFilteredOwners = () => {
    setSelectedPhoneNumbers((current) => {
      const combined = new Set(current);
      filteredOwners.forEach((owner) => combined.add(owner.phoneNumber));
      return Array.from(combined);
    });
  };

  const clearSelectedOwners = () => {
    setSelectedPhoneNumbers([]);
  };

  const toggleCampaignOwnerSelection = (phoneNumber: string) => {
    setCampaignSelectedPhoneNumbers((current) =>
      current.includes(phoneNumber)
        ? current.filter((item) => item !== phoneNumber)
        : [...current, phoneNumber]
    );
  };

  const selectFilteredCampaignOwners = () => {
    setCampaignSelectedPhoneNumbers((current) => {
      const combined = new Set(current);
      filteredCampaignOwners.forEach((owner) => combined.add(owner.phoneNumber));
      return Array.from(combined);
    });
  };

  const clearCampaignSelectedOwners = () => {
    setCampaignSelectedPhoneNumbers([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!trimmedMessage) {
      toast.error('Message is required');
      return;
    }

    if (!broadcastCampaignName.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    if (targetMode === 'SELECTED_USERS' && selectedPhoneNumbers.length === 0) {
      toast.error('Select at least one user');
      return;
    }

    setSending(true);

    try {
      const response = targetMode === 'ALL_USERS'
        ? await broadcastSmsApiService.broadcastToAllUsers({
            campaignName: broadcastCampaignName,
            message: trimmedMessage,
          })
        : await broadcastSmsApiService.broadcastToSelectedUsers({
            campaignName: broadcastCampaignName,
            message: trimmedMessage,
            phoneNumbers: selectedPhoneNumbers,
          });

      toast.success(response.message);
      setBroadcastCampaignName('');
      setMessage('');
      if (targetMode === 'SELECTED_USERS') {
        setSelectedPhoneNumbers([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send broadcast SMS';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const resetCampaignFilterPreview = () => {
    setCampaignFilteredOwners([]);
    setCampaignFiltersApplied(false);
  };

  const resetCampaignFilters = () => {
    setCampaignForm((current) => ({
      ...current,
      sources: [],
      registeredFromDate: '',
      registeredToDate: '',
      minProductCount: '',
      maxProductCount: '',
      minSaleCount: '',
      maxSaleCount: '',
      minPurchaseCount: '',
      maxPurchaseCount: '',
      minStoreCount: '',
      maxStoreCount: '',
      minStaffCount: '',
      maxStaffCount: '',
      expiredPlanOnly: false,
      activePlanOnly: false,
    }));
    setCampaignOwnerSearch('');
    resetCampaignFilterPreview();
  };

  const numberOrUndefined = (value: string) => {
    if (value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const parseCampaignFilters = (campaign?: SmsCampaign | null) => {
    if (!campaign?.filtersJson) return null;
    try {
      return JSON.parse(campaign.filtersJson);
    } catch {
      return null;
    }
  };

  const toStartOfDay = (date: string) => (date ? `${date}T00:00:00` : undefined);
  const toEndOfDay = (date: string) => (date ? `${date}T23:59:59` : undefined);

  const updateCampaignField = (field: keyof CampaignFormState, value: string | boolean) => {
    setCampaignForm((current) => ({ ...current, [field]: value }));

    if (field === 'targetMode') {
      setCampaignOwnerSearch('');
      if (value !== 'FILTERED_USERS') {
        resetCampaignFilterPreview();
      }
      if (value === 'SELECTED_USERS') {
        void loadOwners();
      }
      return;
    }

    if (
      field !== 'messageTemplateId' &&
      field !== 'campaignName' &&
      field !== 'deliveryChannel' &&
      campaignForm.targetMode === 'FILTERED_USERS'
    ) {
      resetCampaignFilterPreview();
    }
  };

  const toggleCampaignSource = (source: string) => {
    setCampaignForm((current) => ({
      ...current,
      sources: current.sources.includes(source)
        ? current.sources.filter((item) => item !== source)
        : [...current.sources, source],
    }));
    resetCampaignFilterPreview();
  };

  const buildOwnerFilterParams = (): OwnersQueryParams => ({
    sources: campaignForm.sources.length > 0 ? campaignForm.sources : undefined,
    registeredFrom: toStartOfDay(campaignForm.registeredFromDate),
    registeredTo: toEndOfDay(campaignForm.registeredToDate),
    minProducts: numberOrUndefined(campaignForm.minProductCount),
    maxProducts: numberOrUndefined(campaignForm.maxProductCount),
    minSales: numberOrUndefined(campaignForm.minSaleCount),
    maxSales: numberOrUndefined(campaignForm.maxSaleCount),
    minPurchases: numberOrUndefined(campaignForm.minPurchaseCount),
    maxPurchases: numberOrUndefined(campaignForm.maxPurchaseCount),
    minStores: numberOrUndefined(campaignForm.minStoreCount),
    maxStores: numberOrUndefined(campaignForm.maxStoreCount),
    minStaff: numberOrUndefined(campaignForm.minStaffCount),
    maxStaff: numberOrUndefined(campaignForm.maxStaffCount),
    expiredPlan: campaignForm.expiredPlanOnly ? true : campaignForm.activePlanOnly ? false : undefined,
  });

  const applyCampaignFilters = async () => {
    if (campaignForm.expiredPlanOnly && campaignForm.activePlanOnly) {
      toast.error('Choose either expired plan or active plan, not both');
      return;
    }

    try {
      setCampaignFiltersLoading(true);
      const collectedOwners: Owner[] = [];
      let page = 0;
      let totalPages = 1;

      while (page < totalPages) {
        const response = await ownersService.getOwners({
          ...buildOwnerFilterParams(),
          page,
          size: 100,
          sortBy: 'createdAt',
          sortDir: 'desc',
        });

        const payload = response.data;
        const pageOwners = payload?.content || [];
        collectedOwners.push(...pageOwners.filter((owner) => owner.phoneNumber?.trim()));
        totalPages = payload?.totalPages || 0;
        page += 1;
      }

      const uniqueOwners = Array.from(
        new Map(collectedOwners.map((owner) => [owner.phoneNumber, owner])).values()
      );

      setCampaignFilteredOwners(uniqueOwners);
      setCampaignFiltersApplied(true);
      setCampaignOwnerSearch('');
      toast.success(`${uniqueOwners.length} user${uniqueOwners.length === 1 ? '' : 's'} matched the filters`);
    } catch (error) {
      console.error('Failed to apply campaign filters:', error);
      toast.error('Failed to apply campaign filters');
    } finally {
      setCampaignFiltersLoading(false);
    }
  };

  const buildFilteredCampaignPayload = (): FilteredBroadcastSmsRequest => ({
    campaignName: campaignForm.campaignName.trim(),
    messageTemplateId: campaignForm.messageTemplateId,
    targetMode: campaignForm.targetMode,
    deliveryChannel: campaignForm.deliveryChannel,
    phoneNumbers: campaignForm.targetMode === 'SELECTED_USERS' ? campaignSelectedPhoneNumbers : undefined,
    sources: campaignForm.targetMode === 'FILTERED_USERS' && campaignForm.sources.length > 0 ? campaignForm.sources : undefined,
    registeredFromDate: campaignForm.targetMode === 'FILTERED_USERS' ? campaignForm.registeredFromDate || undefined : undefined,
    registeredToDate: campaignForm.targetMode === 'FILTERED_USERS' ? campaignForm.registeredToDate || undefined : undefined,
    minProductCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.minProductCount) : undefined,
    maxProductCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.maxProductCount) : undefined,
    minSaleCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.minSaleCount) : undefined,
    maxSaleCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.maxSaleCount) : undefined,
    minPurchaseCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.minPurchaseCount) : undefined,
    maxPurchaseCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.maxPurchaseCount) : undefined,
    minStoreCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.minStoreCount) : undefined,
    maxStoreCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.maxStoreCount) : undefined,
    minStaffCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.minStaffCount) : undefined,
    maxStaffCount: campaignForm.targetMode === 'FILTERED_USERS' ? numberOrUndefined(campaignForm.maxStaffCount) : undefined,
    expiredPlanOnly: campaignForm.targetMode === 'FILTERED_USERS' ? campaignForm.expiredPlanOnly || undefined : undefined,
    activePlanOnly: campaignForm.targetMode === 'FILTERED_USERS' ? campaignForm.activePlanOnly || undefined : undefined,
  });

  const handleCreateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!campaignForm.messageTemplateId) {
      toast.error('Select a message template');
      return;
    }

    if (!campaignForm.campaignName.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    if (campaignForm.deliveryChannel !== 'SMS' && selectedCampaignTemplate?.status !== 'APPROVED') {
      toast.error('WhatsApp campaigns require an approved template');
      return;
    }

    if (campaignForm.targetMode === 'SELECTED_USERS' && campaignSelectedPhoneNumbers.length === 0) {
      toast.error('Select at least one user');
      return;
    }

    if (campaignForm.targetMode === 'FILTERED_USERS') {
      if (campaignForm.expiredPlanOnly && campaignForm.activePlanOnly) {
        toast.error('Choose either expired plan or active plan, not both');
        return;
      }

      if (!campaignFiltersApplied) {
        toast.error('Apply filters before creating the campaign');
        return;
      }

      if (campaignFilteredOwners.length === 0) {
        toast.error('No users match the selected filters');
        return;
      }
    }

    setCreatingCampaign(true);
    try {
      const response = await broadcastSmsApiService.broadcastToFilteredUsers(buildFilteredCampaignPayload());
      toast.success(response.message);
      setCampaignForm(defaultCampaignForm);
      setCampaignSelectedPhoneNumbers([]);
      setCampaignFilteredOwners([]);
      setCampaignFiltersApplied(false);
      setCampaignOwnerSearch('');
      setShowCreateCampaignModal(false);
      setActiveView('CAMPAIGN_LIST');
      await loadCampaigns();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      toast.error(errorMessage);
    } finally {
      setCreatingCampaign(false);
    }
  };

  const openCampaignDetails = (campaign: SmsCampaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetailsModal(true);
  };

  const openRerunCampaign = (campaign: SmsCampaign) => {
    const filters = parseCampaignFilters(campaign);
    setRerunCampaign(campaign);
    setRerunForm({
      campaignName: `Rerun - ${campaign.campaignName || 'Campaign'}`,
      messageTemplateId: campaign.messageTemplateId || (typeof filters?.messageTemplateId === 'string' ? filters.messageTemplateId : ''),
      deliveryChannel: campaign.deliveryChannel || 'SMS',
    });
    setShowRerunCampaignModal(true);
  };

  const updateRerunField = (field: keyof RerunCampaignFormState, value: string) => {
    setRerunForm((current) => ({ ...current, [field]: value }));
  };

  const handleRerunCampaign = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!rerunCampaign) {
      return;
    }

    if (!rerunForm.messageTemplateId) {
      toast.error('Select a message template before rerunning a campaign');
      return;
    }

    if (rerunForm.deliveryChannel !== 'SMS' && selectedRerunTemplate?.status !== 'APPROVED') {
      toast.error('WhatsApp campaign reruns require an approved template');
      return;
    }

    setRerunningCampaignId(rerunCampaign.id);
    try {
      const response = await broadcastSmsApiService.rerunCampaignWithOptions(rerunCampaign.id, {
        campaignName: rerunForm.campaignName.trim() || undefined,
        messageTemplateId: rerunForm.messageTemplateId,
        deliveryChannel: rerunForm.deliveryChannel,
      });
      toast.success(response.message);
      setShowRerunCampaignModal(false);
      setRerunCampaign(null);
      await loadCampaigns();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rerun campaign';
      toast.error(errorMessage);
    } finally {
      setRerunningCampaignId(null);
    }
  };

  const updateTemplateField = (field: keyof TemplateFormState, value: string) => {
    setTemplateForm((current) => ({ ...current, [field]: value }));
  };

  const updateTemplateVariableExample = (variable: TemplateVariable, value: string) => {
    setTemplateForm((current) => {
      const variables = extractTemplateVariables(current.bodyText);
      const values = {
        ...readTemplateParameterValues(current.defaultBodyParametersJson),
        [variable.key]: value,
      };
      const parameters = variables.map((item) => ({
        type: 'text',
        text: values[item.key] || '',
      }));

      return {
        ...current,
        defaultBodyParametersJson: JSON.stringify(parameters, null, 2),
      };
    });
  };

  const handleCreateTemplate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!templateForm.templateName.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!templateForm.bodyText.trim()) {
      toast.error('Template body is required');
      return;
    }

    const variableError = validateTemplateVariableRules(templateForm.bodyText, templateVariables, templateParameterValues);
    if (variableError) {
      toast.error(variableError);
      return;
    }

    const defaultBodyParameters: MessageTemplateParameter[] | undefined = templateVariables.length > 0
      ? templateVariables.map((variable) => ({
          type: 'text',
          text: templateParameterValues[variable.key]?.trim() || '',
        }))
      : undefined;

    setCreatingTemplate(true);
    try {
      const payload = {
        templateName: templateForm.templateName.trim(),
        languageCode: templateForm.languageCode.trim() || 'en_US',
        category: templateForm.category.trim() || 'UTILITY',
        bodyText: templateForm.bodyText.trim(),
        headerText: templateForm.headerText.trim() || undefined,
        footerText: templateForm.footerText.trim() || undefined,
        defaultBodyParameters,
      };
      const template = editingTemplate
        ? await broadcastSmsApiService.updateMessageTemplate(editingTemplate.id, payload)
        : await broadcastSmsApiService.createMessageTemplate(payload);
      toast.success(`Template ${template.templateName} ${editingTemplate ? 'updated' : 'submitted to Meta'}`);
      setTemplateForm(defaultTemplateForm);
      setEditingTemplate(null);
      setShowCreateTemplateModal(false);
      await loadMessageTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create message template');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm(defaultTemplateForm);
    setShowCreateTemplateModal(true);
  };

  const openCreateCampaign = () => {
    setShowCreateCampaignModal(true);
    if (messageTemplates.length === 0) {
      void loadMessageTemplates();
    }
  };

  const openEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      templateName: template.templateName,
      languageCode: template.languageCode || 'en_US',
      category: template.category || 'UTILITY',
      bodyText: template.bodyText || '',
      headerText: '',
      footerText: '',
      defaultBodyParametersJson: template.defaultBodyParametersJson || '[]',
    });
    setShowCreateTemplateModal(true);
  };

  const handleSyncTemplates = async () => {
    setSyncingTemplates(true);
    try {
      const response = await broadcastSmsApiService.syncMessageTemplates();
      toast.success(response.message);
      await loadMessageTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync message templates');
    } finally {
      setSyncingTemplates(false);
    }
  };

  const formatCampaignDate = (value?: string) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatOwnerRegisteredDate = (value?: string) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOwnerPlanStatus = (owner: Owner) => {
    if (!owner.subscription?.endDate) {
      return 'Expired';
    }

    return new Date(owner.subscription.endDate).getTime() < Date.now() ? 'Expired' : 'Active';
  };

  const formatFilters = (filtersJson?: string) => {
    if (!filtersJson) return 'No filters';
    try {
      return JSON.stringify(JSON.parse(filtersJson), null, 2);
    } catch {
      return filtersJson;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create filtered SMS campaigns, send broadcasts, and review campaign history."
        icon={Megaphone}
      />

      <div className="px-2 py-6">
        {activeView === 'CAMPAIGN_LIST' && (
        <Card className="mb-6 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Campaign List</h2>
              <p className="text-sm text-slate-500">Review campaign history or create a filtered campaign.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={loadCampaigns} className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button type="button" onClick={openCreateCampaign} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>
        </Card>
        )}

        {activeView === 'BROADCAST_SMS' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-6 text-white">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Compose broadcast</h2>
                  <p className="mt-1 max-w-2xl text-sm text-emerald-50/90">
                    Choose whether this SMS goes to all users or only the users you select below.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTargetMode('ALL_USERS')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    targetMode === 'ALL_USERS'
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">All users</p>
                      <p className="mt-1 text-sm text-neutral-600">Use `target=ALL_USERS` for a full broadcast.</p>
                    </div>
                    {targetMode === 'ALL_USERS' && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetMode('SELECTED_USERS');
                    void loadOwners();
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    targetMode === 'SELECTED_USERS'
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Selected users</p>
                      <p className="mt-1 text-sm text-neutral-600">Send to only the phone numbers you choose.</p>
                    </div>
                    {targetMode === 'SELECTED_USERS' && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                  </div>
                </button>
              </div>

              {targetMode === 'SELECTED_USERS' && (
                <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">Select users</h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        Pick one or more users from the existing owner directory.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={selectFilteredOwners} disabled={ownersLoading || filteredOwners.length === 0}>
                        Select filtered
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={clearSelectedOwners} disabled={selectedPhoneNumbers.length === 0}>
                        Clear selection
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={ownerSearch}
                      onChange={(event) => setOwnerSearch(event.target.value)}
                      placeholder="Search by name, phone number, or email..."
                      className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {selectedOwners.length > 0 && (
                    <div className="rounded-2xl border border-primary-100 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-neutral-900">
                          Selected users ({selectedOwners.length})
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedOwners.map((owner) => (
                          <span
                            key={owner.phoneNumber}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm text-primary-800"
                          >
                            <span>{owner.fullName} · {owner.phoneNumber}</span>
                            <button
                              type="button"
                              onClick={() => removeSelectedPhoneNumber(owner.phoneNumber)}
                              className="rounded-full p-0.5 text-primary-700 transition hover:bg-primary-100"
                              aria-label={`Remove ${owner.fullName}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white">
                    {ownersLoading ? (
                      <div className="p-6 text-center text-sm text-neutral-500">Loading users...</div>
                    ) : filteredOwners.length === 0 ? (
                      <div className="p-6 text-center text-sm text-neutral-500">No users found for this search.</div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {filteredOwners.map((owner) => {
                          const isSelected = selectedPhoneNumbers.includes(owner.phoneNumber);

                          return (
                            <label
                              key={owner.phoneNumber}
                              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-neutral-50 ${
                                isSelected ? 'bg-primary-50/60' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleOwnerSelection(owner.phoneNumber)}
                                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-900">{owner.fullName}</p>
                                <p className="text-sm text-neutral-600">{owner.phoneNumber}</p>
                                <p className="truncate text-xs text-neutral-500">{owner.email}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="broadcast-campaign-name" className="text-sm font-semibold text-neutral-900">
                  Campaign Name
                </label>
                <input
                  id="broadcast-campaign-name"
                  type="text"
                  value={broadcastCampaignName}
                  onChange={(event) => setBroadcastCampaignName(event.target.value)}
                  placeholder="e.g. July announcement"
                  maxLength={150}
                  disabled={sending}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="broadcast-message" className="text-sm font-semibold text-neutral-900">
                  Message
                </label>
                <textarea
                  id="broadcast-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type the message that should be delivered to all users..."
                  rows={10}
                  disabled={sending}
                  className="min-h-[220px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
                  <span>{trimmedMessage.length} characters</span>
                  <span>{smsSegments} SMS segment{smsSegments === 1 ? '' : 's'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" isLoading={sending} className="inline-flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>{sending ? 'Sending broadcast...' : 'Send Broadcast SMS'}</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={sending || !message}
                  onClick={() => setMessage('')}
                >
                  Clear message
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Audience</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    {targetMode === 'ALL_USERS'
                      ? <>Target is set to <span className="font-semibold text-neutral-900">ALL_USERS</span>.</>
                      : <>This message will go to <span className="font-semibold text-neutral-900">{selectedPhoneNumbers.length}</span> selected user{selectedPhoneNumbers.length === 1 ? '' : 's'}.</>}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-900">Before sending</h3>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>Keep the message concise so it fits typical SMS delivery rules.</li>
                    <li>Double-check links, dates, and contact numbers before sending.</li>
                    <li>Use this only for announcements intended for the full user base.</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900">Preview</h3>
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  SMS body
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-800">
                  {trimmedMessage || 'Your message preview will appear here.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
        ) : activeView === 'MESSAGE_TEMPLATES' ? (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Message Templates</h2>
                  <p className="text-sm text-slate-500">Create Meta WhatsApp templates and track approval status.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={loadMessageTemplates} className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSyncTemplates}
                    isLoading={syncingTemplates}
                    className="inline-flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync Meta Status
                  </Button>
                  <Button type="button" onClick={openCreateTemplate} className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary-50 p-3 text-primary-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Template List</h2>
                    <p className="text-sm text-slate-500">Only approved templates can be used for WhatsApp campaigns.</p>
                  </div>
                </div>
              </div>

              {templatesLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading templates...</div>
              ) : messageTemplates.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No message templates found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Template</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Language</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Body</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Synced</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {messageTemplates.map((template) => {
                        const isApproved = template.status === 'APPROVED';
                        const isRejected = template.status === 'REJECTED';

                        return (
                          <tr key={template.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-slate-900">{template.templateName}</div>
                              <div className="mt-1 text-xs text-slate-500">{template.metaTemplateId || 'Meta id pending'}</div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{template.languageCode}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{template.category}</td>
                            <td className="max-w-md px-6 py-4 text-sm text-slate-700">
                              <div className="line-clamp-2">{template.bodyText}</div>
                              {template.rejectedReason && (
                                <div className="mt-1 text-xs text-rose-600">{template.rejectedReason}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : isRejected
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                              }`}>
                                {template.status || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                              {formatCampaignDate(template.lastSyncedAt || template.updatedAt || template.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button type="button" variant="secondary" size="sm" onClick={() => openEditTemplate(template)}>
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-50 p-3 text-primary-700">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Campaign List</h2>
                  <p className="text-sm text-slate-500">Review SMS campaigns that have already been queued.</p>
                </div>
              </div>
            </div>

            {campaignsLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No campaigns found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-slate-50">
                        <td className="max-w-[220px] px-6 py-4">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {campaign.campaignName || 'Untitled campaign'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{formatCampaignDate(campaign.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {campaign.target}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                            {campaign.deliveryChannel || 'SMS'}
                          </span>
                        </td>
                        <td className="max-w-md px-6 py-4 text-sm text-slate-700">
                          <div className="line-clamp-2">{campaign.messageContent}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{campaign.recipientCount ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {campaign.status || 'QUEUED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" size="sm" onClick={() => openCampaignDetails(campaign)}>
                              Details
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              isLoading={rerunningCampaignId === campaign.id}
                              onClick={() => openRerunCampaign(campaign)}
                            >
                              Rerun
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      <Modal
        isOpen={showCreateCampaignModal}
        onClose={() => {
          setShowCreateCampaignModal(false);
          setCampaignOwnerSearch('');
          resetCampaignFilterPreview();
        }}
        title="Create Campaign"
        size="2xl"
      >
        <form
          onSubmit={handleCreateCampaign}
          onKeyDown={(event) => {
            const target = event.target as HTMLElement;
            if (event.key === 'Enter' && target.tagName !== 'TEXTAREA') {
              event.preventDefault();
            }
          }}
          className="space-y-6"
        >
          <div>
            <label className="text-sm font-semibold text-slate-900">Campaign Name</label>
            <input
              type="text"
              value={campaignForm.campaignName}
              onChange={(event) => updateCampaignField('campaignName', event.target.value)}
              placeholder="e.g. July product education campaign"
              maxLength={150}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-900">Message Template</label>
              <select
                value={campaignForm.messageTemplateId}
                onChange={(event) => updateCampaignField('messageTemplateId', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select template</option>
                {messageTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.templateName} · {template.languageCode} · {template.status || 'UNKNOWN'}
                  </option>
                ))}
              </select>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
                  <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                    selectedCampaignTemplate?.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : selectedCampaignTemplate?.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedCampaignTemplate?.status || 'No template selected'}
                  </span>
                </div>
                {campaignForm.deliveryChannel !== 'SMS' && selectedCampaignTemplate?.status !== 'APPROVED' && (
                  <p className="mt-2 text-xs text-amber-700">WhatsApp campaigns can only use approved Meta templates.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Preview</p>
              <div className="mt-2 min-h-[230px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {campaignForm.deliveryChannel === 'WHATSAPP' ? 'WhatsApp message' : campaignForm.deliveryChannel === 'BOTH' ? 'SMS and WhatsApp message' : 'SMS message'}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {selectedCampaignTemplate?.bodyText || 'Select a message template to preview it.'}
                </p>
                {selectedCampaignTemplate && (
                  <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <span>{selectedCampaignTemplate.bodyText.length} characters</span>
                    <span>{Math.max(1, Math.ceil(selectedCampaignTemplate.bodyText.length / 160))} SMS segment(s)</span>
                    <span>{selectedCampaignTemplate.templateName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Channel</div>
              <div className="grid grid-cols-3 gap-2">
                {(['SMS', 'WHATSAPP', 'BOTH'] as CampaignDeliveryChannel[]).map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => updateCampaignField('deliveryChannel', channel)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      campaignForm.deliveryChannel === channel
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Target</div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['ALL_USERS', 'All users'],
                  ['SELECTED_USERS', 'Selected users'],
                  ['FILTERED_USERS', 'Filtered users'],
                ] as Array<[CampaignFormState['targetMode'], string]>).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateCampaignField('targetMode', mode)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      campaignForm.targetMode === mode
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {campaignForm.targetMode === 'FILTERED_USERS' && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Campaign Filters</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Apply filters to fetch and preview the users affected by this campaign.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={resetCampaignFilters}
                    disabled={campaignFiltersLoading}
                  >
                    Reset Filters
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyCampaignFilters}
                    isLoading={campaignFiltersLoading}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sourceOptions.map((source) => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => toggleCampaignSource(source)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          campaignForm.sources.includes(source)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered From</label>
                  <input
                    type="date"
                    value={campaignForm.registeredFromDate}
                    onChange={(event) => updateCampaignField('registeredFromDate', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered To</label>
                  <input
                    type="date"
                    value={campaignForm.registeredToDate}
                    onChange={(event) => updateCampaignField('registeredToDate', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ['Products', 'minProductCount', 'maxProductCount'],
                  ['Sales', 'minSaleCount', 'maxSaleCount'],
                  ['Purchases', 'minPurchaseCount', 'maxPurchaseCount'],
                  ['Stores', 'minStoreCount', 'maxStoreCount'],
                  ['Staff', 'minStaffCount', 'maxStaffCount'],
                ].map(([label, minField, maxField]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        value={campaignForm[minField as keyof CampaignFormState] as string}
                        onChange={(event) => updateCampaignField(minField as keyof CampaignFormState, event.target.value)}
                        placeholder="Min"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                      <input
                        type="number"
                        min="0"
                        value={campaignForm[maxField as keyof CampaignFormState] as string}
                        onChange={(event) => updateCampaignField(maxField as keyof CampaignFormState, event.target.value)}
                        placeholder="Max"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={campaignForm.expiredPlanOnly}
                      onChange={(event) => updateCampaignField('expiredPlanOnly', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Expired plan only
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={campaignForm.activePlanOnly}
                      onChange={(event) => updateCampaignField('activePlanOnly', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Active plan only
                  </label>
                </div>
                <p className="text-sm text-slate-500">
                  {campaignFiltersApplied
                    ? `${campaignFilteredOwners.length} affected user${campaignFilteredOwners.length === 1 ? '' : 's'}`
                    : 'Apply filters to preview affected users.'}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Targeted Users ({
                    campaignForm.targetMode === 'ALL_USERS'
                      ? 'All active'
                      : campaignForm.targetMode === 'SELECTED_USERS'
                        ? campaignSelectedPhoneNumbers.length
                        : campaignFilteredOwners.length
                  })
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {campaignForm.targetMode === 'ALL_USERS'
                    ? 'All active users will be resolved when you click Create Campaign. No user list is loaded in the background.'
                    : campaignForm.targetMode === 'SELECTED_USERS'
                      ? 'Only checked users will be targeted. Filters are ignored for selected-user campaigns.'
                      : 'Users matching the applied filters will be targeted.'}
                </p>
              </div>
              {campaignForm.targetMode === 'SELECTED_USERS' && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={selectFilteredCampaignOwners} disabled={ownersLoading || filteredCampaignOwners.length === 0}>
                    Select filtered
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearCampaignSelectedOwners} disabled={campaignSelectedPhoneNumbers.length === 0}>
                    Clear selection
                  </Button>
                </div>
              )}
            </div>

            {campaignForm.targetMode !== 'ALL_USERS' && (
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={campaignOwnerSearch}
                  onChange={(event) => setCampaignOwnerSearch(event.target.value)}
                  placeholder="Search target users by name, phone, email, or source..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            )}

            <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white">
              {campaignForm.targetMode === 'ALL_USERS' ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Recipient list will be fetched only after you click Create Campaign.
                </div>
              ) : ownersLoading ? (
                <div className="p-6 text-center text-sm text-slate-500">Loading users...</div>
              ) : campaignForm.targetMode === 'FILTERED_USERS' && campaignFiltersLoading ? (
                <div className="p-6 text-center text-sm text-slate-500">Applying filters...</div>
              ) : campaignForm.targetMode === 'FILTERED_USERS' && !campaignFiltersApplied ? (
                <div className="p-6 text-center text-sm text-slate-500">Apply filters to see affected users.</div>
              ) : filteredCampaignOwners.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No users found.</div>
              ) : (
                <table className="w-full table-fixed divide-y divide-slate-100">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      {campaignForm.targetMode === 'SELECTED_USERS' && <th className="w-8 px-2 py-3" />}
                      <th className="w-[18%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Name</th>
                      <th className="w-[14%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Phone</th>
                      <th className="w-[9%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Src</th>
                      <th className="w-[8%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Store</th>
                      <th className="w-[8%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Prod</th>
                      <th className="w-[8%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Sales</th>
                      <th className="w-[8%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Purch</th>
                      <th className="w-[14%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Reg</th>
                      <th className="w-[13%] px-2 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCampaignOwners.map((owner) => {
                      const selected = campaignForm.targetMode === 'ALL_USERS' || campaignForm.targetMode === 'FILTERED_USERS' || campaignSelectedPhoneNumbers.includes(owner.phoneNumber);
                      const planStatus = getOwnerPlanStatus(owner);

                      return (
                        <tr key={owner.phoneNumber} className={selected ? 'bg-primary-50/40' : 'bg-white'}>
                          {campaignForm.targetMode === 'SELECTED_USERS' && (
                            <td className="px-2 py-3">
                              <input
                                type="checkbox"
                                checked={campaignSelectedPhoneNumbers.includes(owner.phoneNumber)}
                                onChange={() => toggleCampaignOwnerSelection(owner.phoneNumber)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                              />
                            </td>
                          )}
                          <td className="truncate px-2 py-3 text-xs font-medium text-slate-900" title={owner.fullName}>{owner.fullName}</td>
                          <td className="truncate px-2 py-3 text-xs text-slate-700" title={owner.phoneNumber}>{owner.phoneNumber}</td>
                          <td className="truncate px-2 py-3 text-xs text-slate-700" title={owner.source || 'N/A'}>{owner.source || 'N/A'}</td>
                          <td className="px-2 py-3 text-xs text-slate-700">{owner.activeStores}/{owner.totalStores}</td>
                          <td className="px-2 py-3 text-xs text-slate-700">{owner.productStats?.totalProducts ?? 0}</td>
                          <td className="px-2 py-3 text-xs text-slate-700">{owner.sales?.totalSalesCount ?? 0}</td>
                          <td className="px-2 py-3 text-xs text-slate-700">{owner.purchases?.totalPurchases ?? 0}</td>
                          <td className="truncate px-2 py-3 text-xs text-slate-700">{formatOwnerRegisteredDate(owner.registeredAt)}</td>
                          <td className="px-2 py-3 text-xs">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              planStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {planStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setShowCreateCampaignModal(false);
              setCampaignOwnerSearch('');
              resetCampaignFilterPreview();
            }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creatingCampaign} className="inline-flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showRerunCampaignModal}
        onClose={() => {
          setShowRerunCampaignModal(false);
          setRerunCampaign(null);
        }}
        title="Confirm Campaign Rerun"
        size="xl"
      >
        {rerunCampaign && (
          <form onSubmit={handleRerunCampaign} className="space-y-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">This will resend to the same audience.</p>
              <p className="mt-1 text-sm text-amber-800">
                Campaign: {rerunCampaign.campaignName || 'Untitled campaign'} · Target: {rerunCampaign.target} · Recipients: {rerunCampaign.recipientCount ?? 0}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">New Campaign Name</label>
              <input
                type="text"
                value={rerunForm.campaignName}
                onChange={(event) => updateRerunField('campaignName', event.target.value)}
                placeholder="Rerun campaign name"
                maxLength={150}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-900">Message Template</label>
                <select
                  value={rerunForm.messageTemplateId}
                  onChange={(event) => updateRerunField('messageTemplateId', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Select template</option>
                  {messageTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.templateName} · {template.languageCode} · {template.status || 'UNKNOWN'}
                    </option>
                  ))}
                </select>
                {rerunForm.deliveryChannel !== 'SMS' && selectedRerunTemplate?.status !== 'APPROVED' && (
                  <p className="mt-2 text-xs text-amber-700">WhatsApp reruns can only use approved Meta templates.</p>
                )}
              </div>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {selectedRerunTemplate?.bodyText || 'Select a message template to preview it.'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Channel</div>
              <div className="grid grid-cols-3 gap-2">
                {(['SMS', 'WHATSAPP', 'BOTH'] as CampaignDeliveryChannel[]).map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => updateRerunField('deliveryChannel', channel)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      rerunForm.deliveryChannel === channel
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => {
                setShowRerunCampaignModal(false);
                setRerunCampaign(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={rerunningCampaignId === rerunCampaign.id} className="inline-flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Confirm Rerun
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={showCreateTemplateModal}
        onClose={() => {
          setShowCreateTemplateModal(false);
          setEditingTemplate(null);
          setTemplateForm(defaultTemplateForm);
        }}
        title={editingTemplate ? 'Edit Message Template' : 'Create Message Template'}
        size="2xl"
      >
        <form onSubmit={handleCreateTemplate} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template Name</label>
              <input
                type="text"
                value={templateForm.templateName}
                onChange={(event) => updateTemplateField('templateName', event.target.value)}
                placeholder="appointment_cancellation_1"
                disabled={Boolean(editingTemplate)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Language Code</label>
              <input
                type="text"
                value={templateForm.languageCode}
                onChange={(event) => updateTemplateField('languageCode', event.target.value)}
                placeholder="en_US"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <select
                value={templateForm.category}
                onChange={(event) => updateTemplateField('category', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="UTILITY">UTILITY</option>
                <option value="MARKETING">MARKETING</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Header Text</label>
                <input
                  type="text"
                  value={templateForm.headerText}
                  onChange={(event) => updateTemplateField('headerText', event.target.value)}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Body Text</label>
                <textarea
                  value={templateForm.bodyText}
                  onChange={(event) => updateTemplateField('bodyText', event.target.value)}
                  rows={7}
                  placeholder="Hello {{1}}, your appointment has been cancelled."
                  className="mt-2 min-h-[180px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Footer Text</label>
                <input
                  type="text"
                  value={templateForm.footerText}
                  onChange={(event) => updateTemplateField('footerText', event.target.value)}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
              {templateForm.headerText.trim() && (
                <p className="mt-3 text-sm font-semibold text-slate-900">{templateForm.headerText.trim()}</p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {templateForm.bodyText.trim() || 'Template body preview will appear here.'}
              </p>
              {templateForm.footerText.trim() && (
                <p className="mt-3 text-xs text-slate-500">{templateForm.footerText.trim()}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variable Examples</label>
              <p className="text-sm text-slate-500">
                Add variables in the body as whole numbers only, like {'{{1}}'} and {'{{2}}'}. Examples are required by Meta.
              </p>
            </div>

            {templateVariables.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No variables detected.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {templateVariables.map((variable) => (
                  <div key={variable.key}>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {'{{'}{variable.key}{'}}'} Example
                    </label>
                    <input
                      type="text"
                      value={templateParameterValues[variable.key] || ''}
                      onChange={(event) => updateTemplateVariableExample(variable, event.target.value)}
                      placeholder={`Example ${variable.key}`}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                ))}
              </div>
            )}

            {validateTemplateVariableRules(templateForm.bodyText, templateVariables, templateParameterValues) && (
              <p className="mt-3 text-sm text-amber-700">
                {validateTemplateVariableRules(templateForm.bodyText, templateVariables, templateParameterValues)}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setShowCreateTemplateModal(false);
              setEditingTemplate(null);
              setTemplateForm(defaultTemplateForm);
            }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creatingTemplate} className="inline-flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              {editingTemplate ? 'Update Template' : 'Submit to Meta'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showCampaignDetailsModal}
        onClose={() => setShowCampaignDetailsModal(false)}
        title="Campaign Details"
        size="xl"
      >
        {selectedCampaign && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCampaign.campaignName || 'Untitled campaign'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Target</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCampaign.target}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Channel</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCampaign.deliveryChannel || 'SMS'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Recipients</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCampaign.recipientCount ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Created</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCampaignDate(selectedCampaign.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Message</p>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                {selectedCampaign.messageContent}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Filters</p>
              <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                {formatFilters(selectedCampaign.filtersJson)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
